import prompts from '@/lib/prompts';
import MetaSearchAgent from '@/lib/search/metaSearchAgent';
import crypto from 'crypto';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { EventEmitter } from 'stream';
import {
  getAvailableChatModelProviders,
  getAvailableEmbeddingModelProviders,
} from '@/lib/providers';
import db from '@/lib/db';
import { chats, messages as messagesSchema } from '@/lib/db/schema';
import { and, eq, gt } from 'drizzle-orm';
import { getFileDetails } from '@/lib/utils/files';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOpenAI } from '@langchain/openai';
import {
  getCustomOpenaiApiKey,
  getCustomOpenaiApiUrl,
  getCustomOpenaiModelName,
} from '@/lib/config';
import { searchHandlers } from '@/lib/search';
import { isAuthenticated } from '@/lib/utils/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Message = {
  messageId: string;
  chatId: string;
  content: string;
};

type ChatModel = {
  provider: string;
  name: string;
};

type EmbeddingModel = {
  provider: string;
  name: string;
};

type Body = {
  message: Message;
  optimizationMode: 'speed' | 'balanced' | 'quality';
  focusMode: string;
  history: Array<[string, string]>;
  files: Array<string>;
  chatModel: ChatModel;
  embeddingModel: EmbeddingModel;
  systemInstructions: string;
};

const handleEmitterEvents = async (
  stream: EventEmitter,
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder,
  aiMessageId: string,
  chatId: string,
  isUserAuthenticated: boolean,
  focusMode: string,
) => {
  let recievedMessage = '';
  let sources: any[] = [];

  stream.on('data', (data) => {
    const parsedData = JSON.parse(data);
    if (parsedData.type === 'response') {
      writer.write(
        encoder.encode(
          JSON.stringify({
            type: 'message',
            data: parsedData.data,
            messageId: aiMessageId,
          }) + '\n',
        ),
      );

      recievedMessage += parsedData.data;
    } else if (parsedData.type === 'sources') {
      writer.write(
        encoder.encode(
          JSON.stringify({
            type: 'sources',
            data: parsedData.data,
            messageId: aiMessageId,
          }) + '\n',
        ),
      );

      sources = parsedData.data;
    }
  });
  stream.on('end', () => {
    writer.write(
      encoder.encode(
        JSON.stringify({
          type: 'messageEnd',
          messageId: aiMessageId,
        }) + '\n',
      ),
    );
    writer.close();

    // Create the message object
    const assistantMessage = {
      messageId: aiMessageId,
      chatId: chatId,
      content: recievedMessage,
      role: 'assistant' as const,
      createdAt: new Date(),
      sources: sources && sources.length > 0 ? sources : undefined
    };

    // If user is authenticated, save to database
    if (isUserAuthenticated) {
      db.insert(messagesSchema)
        .values({
          content: recievedMessage,
          chatId: chatId,
          messageId: aiMessageId,
          role: 'assistant',
          metadata: JSON.stringify({
            createdAt: new Date(),
            ...(sources && sources.length > 0 && { sources }),
          }),
        })
        .execute();
    } else {
      // For client-side storage, we'll add a script tag that will be executed on the client
      writer.write(
        encoder.encode(
          JSON.stringify({
            type: 'clientStorage',
            message: assistantMessage,
            focusMode: focusMode,
          }) + '\n',
        ),
      );
    }
  });
  stream.on('error', (data) => {
    const parsedData = JSON.parse(data);
    writer.write(
      encoder.encode(
        JSON.stringify({
          type: 'error',
          data: parsedData.data,
        }),
      ),
    );
    writer.close();
  });
};

const handleHistorySave = async (
  message: Message,
  humanMessageId: string,
  focusMode: string,
  files: string[],
  isUserAuthenticated: boolean,
) => {
  // If user is authenticated, save to database
  if (isUserAuthenticated) {
    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, message.chatId),
    });

    if (!chat) {
      await db
        .insert(chats)
        .values({
          id: message.chatId,
          userId: 1, // Default to admin user ID
          title: message.content,
          createdAt: new Date().toString(),
          focusMode: focusMode,
          files: files.map(getFileDetails),
        })
        .execute();
    }

    const messageExists = await db.query.messages.findFirst({
      where: eq(messagesSchema.messageId, humanMessageId),
    });

    if (!messageExists) {
      await db
        .insert(messagesSchema)
        .values({
          content: message.content,
          chatId: message.chatId,
          messageId: humanMessageId,
          role: 'user',
          metadata: JSON.stringify({
            createdAt: new Date(),
          }),
        })
        .execute();
    } else {
      await db
        .delete(messagesSchema)
        .where(
          and(
            gt(messagesSchema.id, messageExists.id),
            eq(messagesSchema.chatId, message.chatId),
          ),
        )
        .execute();
    }
  }
  // For non-authenticated users, storage will be handled client-side
  // The client will receive a 'clientStorage' event and handle it
};

export const POST = async (req: Request) => {
  try {
    const body = (await req.json()) as Body;
    const { message } = body;

    // Check if user is authenticated
    const isUserAuthenticated = await isAuthenticated();

    if (message.content === '') {
      return Response.json(
        {
          message: 'Please provide a message to process',
        },
        { status: 400 },
      );
    }

    const [chatModelProviders, embeddingModelProviders] = await Promise.all([
      getAvailableChatModelProviders(),
      getAvailableEmbeddingModelProviders(),
    ]);

    const chatModelProvider =
      chatModelProviders[
        body.chatModel?.provider || Object.keys(chatModelProviders)[0]
      ];
    const chatModel =
      chatModelProvider[
        body.chatModel?.name || Object.keys(chatModelProvider)[0]
      ];

    const embeddingProvider =
      embeddingModelProviders[
        body.embeddingModel?.provider || Object.keys(embeddingModelProviders)[0]
      ];
    const embeddingModel =
      embeddingProvider[
        body.embeddingModel?.name || Object.keys(embeddingProvider)[0]
      ];

    let llm: BaseChatModel | undefined;
    let embedding = embeddingModel.model;

    if (body.chatModel?.provider === 'custom_openai') {
      llm = new ChatOpenAI({
        openAIApiKey: getCustomOpenaiApiKey(),
        modelName: getCustomOpenaiModelName(),
        temperature: 0.7,
        configuration: {
          baseURL: getCustomOpenaiApiUrl(),
        },
      }) as unknown as BaseChatModel;
    } else if (chatModelProvider && chatModel) {
      llm = chatModel.model;
    }

    if (!llm) {
      return Response.json({ error: 'Invalid chat model' }, { status: 400 });
    }

    if (!embedding) {
      return Response.json(
        { error: 'Invalid embedding model' },
        { status: 400 },
      );
    }

    const humanMessageId =
      message.messageId ?? crypto.randomBytes(7).toString('hex');
    const aiMessageId = crypto.randomBytes(7).toString('hex');

    const history: BaseMessage[] = body.history.map((msg) => {
      if (msg[0] === 'human') {
        return new HumanMessage({
          content: msg[1],
        });
      } else {
        return new AIMessage({
          content: msg[1],
        });
      }
    });

    const handler = searchHandlers[body.focusMode];

    if (!handler) {
      return Response.json(
        {
          message: 'Invalid focus mode',
        },
        { status: 400 },
      );
    }

    const stream = await handler.searchAndAnswer(
      message.content,
      history,
      llm,
      embedding,
      body.optimizationMode,
      body.files,
      body.systemInstructions,
    );

    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    // Create the user message object
    const userMessage = {
      messageId: humanMessageId,
      chatId: message.chatId,
      content: message.content,
      role: 'user' as const,
      createdAt: new Date()
    };

    // For non-authenticated users, send a message to store on client side
    if (!isUserAuthenticated) {
      writer.write(
        encoder.encode(
          JSON.stringify({
            type: 'clientStorage',
            message: userMessage,
            focusMode: body.focusMode,
            files: body.files,
          }) + '\n',
        ),
      );
    }

    handleEmitterEvents(stream, writer, encoder, aiMessageId, message.chatId, isUserAuthenticated, body.focusMode);
    handleHistorySave(message, humanMessageId, body.focusMode, body.files, isUserAuthenticated);

    return new Response(responseStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (err) {
    console.error('An error occurred while processing chat request:', err);
    return Response.json(
      { message: 'An error occurred while processing chat request' },
      { status: 500 },
    );
  }
};
