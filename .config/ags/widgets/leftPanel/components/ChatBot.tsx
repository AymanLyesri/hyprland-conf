import { Gtk } from "astal/gtk3";
import { Message } from "../../../interfaces/chatbot.interface";
import { bind, execAsync, timeout, Variable } from "astal";
import { notify } from "../../../utils/notification";
import { readJSONFile, writeJSONFile } from "../../../utils/json";
import { chatBotApi, globalTransition } from "../../../variables";
import ToggleButton from "../../toggleButton";
import { chatBotApis } from "../../../constants/api.constants";
// Constants
const MESSAGE_FILE_PATH = "./assets/chatbot";

// State
const imageGeneration = Variable<boolean>(false);
const messages = Variable<Message[]>([]);
const chatHistory = Variable<Message[]>([]);

// Utils
const getMessageFilePath = () =>
  `${MESSAGE_FILE_PATH}/${chatBotApi.get().value}.json`;

const formatTextWithCodeBlocks = (text: string) => {
  const parts = text.split(/```(\w*)?\n?([\s\S]*?)```/gs);
  const elements = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]?.trim();
    if (!part) continue;

    if (i % 3 === 2) {
      // Code content
      elements.push(
        <box className="code-block" spacing={5}>
          <label
            className="text"
            hexpand
            wrap
            halign={Gtk.Align.START}
            label={part}
          />
          <button
            halign={Gtk.Align.END}
            valign={Gtk.Align.START}
            className="copy"
            label=""
            onClick={() => execAsync(`wl-copy "${part}"`).catch(print)}
          />
        </box>
      );
    } else if (i % 3 === 0 && part) {
      // Regular text
      elements.push(<label hexpand wrap xalign={0} label={part} />);
    }
  }

  return (
    <box className="body" vertical spacing={10}>
      {elements}
    </box>
  );
};

const fetchMessages = () => {
  try {
    const fetchedMessages = readJSONFile(getMessageFilePath());
    messages.set(Array.isArray(fetchedMessages) ? fetchedMessages : []);
  } catch {
    return [];
  }
};

const saveMessages = () => {
  writeJSONFile(getMessageFilePath(), messages.get());
};

const sendMessage = async (message: Message) => {
  try {
    const beginTime = Date.now();

    const response = await execAsync(
      `tgpt --quiet ` +
        `--provider ${chatBotApi.get().value} ` +
        `--preprompt 'short and straight forward response, 
        ${JSON.stringify(chatHistory.get())
          .replace(/'/g, `'"'"'`)
          .replace(/`/g, "\\`")}' ` +
        `'${message.content}'`
    );
    const endTime = Date.now();

    notify({ summary: chatBotApi.get().name, body: response });

    const newMessage: Message = {
      id: (messages.get().length + 1).toString(),
      sender: chatBotApi.get().value,
      receiver: "user",
      content: response,
      timestamp: Date.now(),
      responseTime: endTime - beginTime,
    };

    messages.set([...messages.get(), newMessage]);
  } catch (error) {
    notify({
      summary: "Error",
      body: error instanceof Error ? error.message : String(error),
    });
  }
};

const ApiList = () => (
  <box className="api-list" spacing={5}>
    {chatBotApis.map((provider) => (
      <ToggleButton
        hexpand
        state={bind(chatBotApi).as((p) => p.name === provider.name)}
        className="provider"
        label={provider.name}
        onToggled={() => chatBotApi.set(provider)}
      />
    ))}
  </box>
);

// Components
const Info = () => (
  <box className="info" vertical spacing={5}>
    {bind(chatBotApi).as(({ name, description }) => [
      <label className="name" hexpand wrap label={`[${name}]`} />,
      <label className="description" hexpand wrap label={description} />,
    ])}
  </box>
);

const MessageItem = ({ message }: { message: Message }) => {
  const Revealer = () => (
    <revealer
      revealChild={false}
      transitionDuration={globalTransition}
      transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
      child={
        <box className={"info"} spacing={10}>
          <label
            wrap
            className="time"
            label={new Date(message.timestamp).toLocaleString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          />
          <label
            wrap
            className="response-time"
            label={
              message.responseTime
                ? `Response Time: ${message.responseTime} ms`
                : ""
            }
          />
        </box>
      }
    />
  );

  const Actions = () => (
    <box
      className="actions"
      spacing={5}
      valign={message.sender === "user" ? Gtk.Align.START : Gtk.Align.END}
      vertical>
      {[
        <button
          className="copy"
          label=""
          onClicked={() =>
            execAsync(`wl-copy "${message.content}"`).catch(print)
          }
        />,
      ]}
    </box>
  );

  const revealerInstance = Revealer();
  return (
    <eventbox
      className={"message-eventbox"}
      onHover={() => (revealerInstance.reveal_child = true)}
      onHoverLost={() => (revealerInstance.reveal_child = false)}
      halign={message.sender === "user" ? Gtk.Align.END : Gtk.Align.START}
      child={
        <box
          className={`message ${message.sender}`}
          halign={Gtk.Align.START}
          vertical>
          <box className={"main"}>
            {message.sender !== "user"
              ? [<Actions />, formatTextWithCodeBlocks(message.content)]
              : [formatTextWithCodeBlocks(message.content), <Actions />]}
          </box>
          {revealerInstance}
        </box>
      }
    />
  );
};

const Messages = () => (
  <scrollable
    vexpand
    setup={(self) => {
      self.hook(messages, () => {
        timeout(100, () => {
          self.get_vadjustment().set_value(self.get_vadjustment().get_upper());
        });
      });
    }}
    child={
      <box className="messages" vertical spacing={10}>
        {bind(messages).as((msgs) =>
          msgs.map((msg) => <MessageItem message={msg} />)
        )}
      </box>
    }
  />
);

const ClearButton = () => (
  <button
    halign={Gtk.Align.CENTER}
    valign={Gtk.Align.CENTER}
    label=""
    className="clear"
    onClicked={() => {
      messages.set([]);
    }}
  />
);

// const ImageGenerationSwitch = ({
//   chatBotApi,
// }: {
//   chatBotApi: Variable<Provider>;
// }) => (
//   <switch
//     visible={chatBotApi.get().imageGenerationSupport}
//     active={imageGeneration.get()}
//     onButtonPressEvent={() => imageGeneration.set(!imageGeneration.get())}
//   />
// );

const MessageEntry = () => {
  const handleSubmit = (self: Gtk.Entry) => {
    const text = self.get_text();
    if (!text) return;

    const newMessage: Message = {
      id: (messages.get().length + 1).toString(),
      sender: "user",
      receiver: chatBotApi.get().value,
      content: text,
      timestamp: Date.now(),
    };

    messages.set([...messages.get(), newMessage]);
    sendMessage(newMessage);
    self.set_text("");
  };

  return (
    <entry hexpand placeholderText="Type a message" onActivate={handleSubmit} />
  );
};

const BottomBar = () => (
  <box spacing={5}>
    <MessageEntry />
    <ClearButton />
  </box>
);

export default () => {
  chatBotApi.subscribe(() => fetchMessages());
  messages.subscribe(() => {
    saveMessages();
    // set the last 10 messages to chat history
    chatHistory.set(messages.get().slice(-10));
  });

  fetchMessages();

  return (
    <box className="chat-bot" vertical hexpand spacing={5}>
      <ApiList />
      <Info />
      <Messages />
      <BottomBar />
    </box>
  );
};
