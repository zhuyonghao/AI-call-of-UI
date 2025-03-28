import "server-only";

import { ReactNode, isValidElement } from "react";
import { AIProvider } from "./client";
import { createStreamableUI, createStreamableValue } from "ai/rsc";
import { Runnable } from "@langchain/core/runnables";
import { CompiledStateGraph } from "@langchain/langgraph";
import { StreamEvent } from "@langchain/core/tracers/log_stream";
import { AIMessage } from "@/ai/message";

export const dynamic = "force-dynamic";

export const CUSTOM_UI_YIELD_NAME = "__yield_ui__";

/**
 * Executes `streamEvents` method on a runnable
 * and converts the generator to a RSC friendly stream
 *
 * @param runnable
 * @returns React node which can be sent to the client
 */
export function streamRunnableUI<RunInput, RunOutput>(
  runnable:
    | Runnable<RunInput, RunOutput>
    | CompiledStateGraph<RunInput, Partial<RunInput>>,
  inputs: RunInput,
) {
  const ui = createStreamableUI();
  const [lastEvent, resolve] = withResolvers<string>();

  (async () => {
    let lastEventValue: StreamEvent | null = null;

    const callbacks: Record<
      string,
      ReturnType<typeof createStreamableUI | typeof createStreamableValue>
    > = {};

    for await (const streamEvent of (
      runnable as Runnable<RunInput, RunOutput>
    ).streamEvents(inputs, {
      version: "v2",
    })) {
      if (
        streamEvent.name === CUSTOM_UI_YIELD_NAME &&
        isValidElement(streamEvent.data.output.value)
      ) {
        if (streamEvent.data.output.type === "append") {
          // 直接添加组件，不包装在AIMessage中
          ui.append(streamEvent.data.output.value);
        } else if (streamEvent.data.output.type === "update") {
          ui.update(streamEvent.data.output.value);
        }
      }

      if (streamEvent.event === "on_chat_model_stream") {
        const chunk = streamEvent.data.chunk;
        if ("text" in chunk && typeof chunk.text === "string") {
          if (!callbacks[streamEvent.run_id]) {
            // 对于文本流，创建一个新的流
            const textStream = createStreamableValue();
            // 使用AIMessage包装文本内容
            ui.append(<AIMessage value={textStream.value} />);
            callbacks[streamEvent.run_id] = textStream;
          }

          callbacks[streamEvent.run_id].append(chunk.text);
        }
      }

      lastEventValue = streamEvent;
    }

    // 解析promise，允许客户端继续
    resolve(lastEventValue?.data.output);

    // 关闭所有文本流的UI流
    Object.values(callbacks).forEach((cb) => cb.done());

    // 关闭组件流的主UI流
    ui.done();
  })();

  return { ui: ui.value, lastEvent };
}

/**
 * Expose these endpoints outside for the client
 * We wrap the functions in order to properly resolve importing
 * client components.
 *
 * TODO: replace with createAI instead, even though that
 * implicitly handles state management
 *
 * See https://github.com/vercel/next.js/pull/59615
 * @param actions
 */
export function exposeEndpoints<T extends Record<string, unknown>>(
  actions: T,
): {
  (props: { children: ReactNode }): Promise<JSX.Element>;
  $$types?: T;
} {
  return async function AI(props: { children: ReactNode }) {
    return <AIProvider actions={actions}>{props.children}</AIProvider>;
  };
}

/**
 * Polyfill to emulate the upcoming Promise.withResolvers
 */
export function withResolvers<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void;

  const innerPromise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  // @ts-expect-error
  return [innerPromise, resolve, reject] as const;
}
