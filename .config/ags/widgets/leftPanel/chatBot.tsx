import { Gtk } from "astal/gtk3";
import { Message, Provider } from "../../interfaces/chatbot.interface";
import { bind, execAsync, timeout, Variable } from "astal";
import { notify } from "../../utils/notification";
import { readJSONFile, writeJSONFile } from "../../utils/json";

// Constants
const MESSAGE_FILE_PATH = "./assets/chatbot";
const DEBOUNCE_TIME = 100;

// State
const imageGeneration = Variable<boolean>(false);
const messages = Variable<Message[]>([]);

// Utils
const getMessageFilePath = (provider: string) =>
  `${MESSAGE_FILE_PATH}/${provider}.json`;

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

const fetchMessages = (provider: string): Message[] => {
  try {
    const fetchedMessages = readJSONFile(getMessageFilePath(provider));
    return Array.isArray(fetchedMessages) ? fetchedMessages : [];
  } catch {
    return [];
  }
};

const saveMessages = (provider: string) => {
  writeJSONFile(getMessageFilePath(provider), messages.get());
};

const sendMessage = async (message: Message, provider: Provider) => {
  try {
    const imgFlag = imageGeneration.get() ? "-img" : "";
    const response = await execAsync(
      `tgpt -q ${imgFlag} --provider ${provider.name} ` +
        `--preprompt 'short and straight forward response' '${message.content}'`
    );

    notify({ summary: "Message sent", body: response });

    const newMessage: Message = {
      id: (messages.get().length + 1).toString(),
      sender: provider.name,
      receiver: "user",
      content: response,
      timestamp: Date.now(),
    };

    messages.set([...messages.get(), newMessage]);
    saveMessages(provider.name);
  } catch (error) {
    notify({
      summary: "Error",
      body: error instanceof Error ? error.message : String(error),
    });
  }
};

// Components
const Info = ({ provider }: { provider: Variable<Provider> }) => (
  <box className="info" vertical spacing={5}>
    {bind(provider).as(({ name, description }) => [
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

const ClearButton = ({ provider }: { provider: Variable<Provider> }) => (
  <button
    halign={Gtk.Align.CENTER}
    valign={Gtk.Align.CENTER}
    label=""
    className="clear"
    onClicked={() => {
      messages.set([]);
      saveMessages(provider.get().name);
    }}
  />
);

const ImageGenerationSwitch = ({
  provider,
}: {
  provider: Variable<Provider>;
}) => (
  <switch
    visible={provider.get().imageGenerationSupport}
    active={imageGeneration.get()}
    onButtonPressEvent={() => imageGeneration.set(!imageGeneration.get())}
  />
);

const MessageEntry = ({ provider }: { provider: Variable<Provider> }) => {
  const handleSubmit = (self: Gtk.Entry) => {
    const text = self.get_text();
    if (!text) return;

    const newMessage: Message = {
      id: (messages.get().length + 1).toString(),
      sender: "user",
      receiver: provider.get().name,
      content: text,
      timestamp: Date.now(),
    };

    messages.set([...messages.get(), newMessage]);
    sendMessage(newMessage, provider.get());
    self.set_text("");
  };

  return (
    <entry hexpand placeholderText="Type a message" onActivate={handleSubmit} />
  );
};

const BottomBar = ({ provider }: { provider: Variable<Provider> }) => (
  <box spacing={5}>
    <MessageEntry provider={provider} />
    <ClearButton provider={provider} />
  </box>
);

export default ({ provider }: { provider: Variable<Provider> }) => {
  // Initialize and watch provider changes
  provider.subscribe((p) => messages.set(fetchMessages(p.name)));
  messages.set(fetchMessages(provider.get().name));

  return (
    <box className="chat-bot" vertical hexpand spacing={5}>
      <Info provider={provider} />
      {Messages}
      <BottomBar provider={provider} />
    </box>
  );
};
