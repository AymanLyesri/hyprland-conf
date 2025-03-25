import { Gtk } from "astal/gtk3";
import { Message, Provider } from "../../interfaces/chatbot.interface";
import { bind, execAsync, timeout, Variable } from "astal";
import { notify } from "../../utils/notification";
import { readJSONFile, writeJSONFile } from "../../utils/json";
import { aiProvider } from "../../variables";
import ToggleButton from "../toggleButton";

const aiProviders: Provider[] = [
  {
    name: "pollinations",
    icon: "Po",
    description: "Completely free, default model is gpt-4o",
    imageGenerationSupport: true,
  },
  {
    name: "phind",
    icon: "Ph",
    description: "Uses Phind Model. Great for developers",
  },
];

// Constants
const MESSAGE_FILE_PATH = "./assets/chatbot";
const DEBOUNCE_TIME = 100;

// State
const imageGeneration = Variable<boolean>(false);
const messages = Variable<Message[]>([]);
messages.subscribe(() => saveMessages());

// Utils
const getMessageFilePath = () =>
  `${MESSAGE_FILE_PATH}/${aiProvider.get().name}.json`;

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
    const imgFlag = imageGeneration.get() ? "-img" : "";
    const response = await execAsync(
      `tgpt -q ${imgFlag} --provider ${aiProvider.get().name} ` +
        `--preprompt 'short and straight forward response' '${message.content}'`
    );

    notify({ summary: "Message sent", body: response });

    const newMessage: Message = {
      id: (messages.get().length + 1).toString(),
      sender: aiProvider.get().name,
      receiver: "user",
      content: response,
      timestamp: Date.now(),
    };

    messages.set([...messages.get(), newMessage]);
  } catch (error) {
    notify({
      summary: "Error",
      body: error instanceof Error ? error.message : String(error),
    });
  }
};

const Providers = (
  <box className="providers" spacing={5}>
    {aiProviders.map((provider) => (
      <ToggleButton
        state={bind(aiProvider).as((p) => p.name === provider.name)}
        className="provider"
        label={provider.icon}
        onToggled={() => aiProvider.set(provider)}
      />
    ))}
  </box>
);

// Components
const Info = () => (
  <box className="info" vertical spacing={5}>
    {bind(aiProvider).as(({ name, description }) => [
      <label className="name" hexpand wrap label={`[${name}]`} />,
      <label className="description" hexpand wrap label={description} />,
    ])}
  </box>
);

const MessageItem = ({ message }: { message: Message }) => (
  <box
    className={`message ${message.sender}`}
    spacing={5}
    halign={message.sender === "user" ? Gtk.Align.END : Gtk.Align.START}>
    {message.sender !== "user" ? (
      <box
        className="actions"
        vexpand={false}
        vertical
        child={
          <button
            valign={Gtk.Align.END}
            vexpand
            className="copy"
            label=""
            onClicked={() =>
              execAsync(`wl-copy "${message.content}"`).catch(print)
            }
          />
        }></box>
    ) : (
      <box />
    )}
    {message.sender === "user" ? (
      <box className="body" spacing={5}>
        <label wrap label={message.content} />
        <button
          className="copy"
          label=""
          halign={Gtk.Align.END}
          valign={Gtk.Align.START}
          onClicked={() =>
            execAsync(`wl-copy "${message.content}"`).catch(print)
          }
        />
      </box>
    ) : (
      formatTextWithCodeBlocks(message.content)
    )}
  </box>
);

const Messages = (
  <scrollable
    vexpand
    setup={(self) => {
      self.hook(messages, () => {
        timeout(DEBOUNCE_TIME, () => {
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
//   aiProvider,
// }: {
//   aiProvider: Variable<Provider>;
// }) => (
//   <switch
//     visible={aiProvider.get().imageGenerationSupport}
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
      receiver: aiProvider.get().name,
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
  fetchMessages();
  return (
    <box className="chat-bot" vertical hexpand spacing={5}>
      {Providers}
      <Info />
      {Messages}
      <BottomBar />
    </box>
  );
};
