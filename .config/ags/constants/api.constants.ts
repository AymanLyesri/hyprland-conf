import { Api } from "../interfaces/api.interface";

export const chatBotApis: Api[] = [
  {
    name: "Pollinations",
    value: "pollinations",
    icon: "Po",
    description: "Completely free, default model is gpt-4o",
  },
  {
    name: "Phind",
    value: "phind",
    icon: "Ph",
    description: "Uses Phind Model. Great for developers",
  },
];

export const booruApis: Api[] = [
  {
    name: "Danbooru",
    value: "danbooru",
    idSearchUrl: "https://danbooru.donmai.us/posts/",
  },
  {
    name: "Gelbooru",
    value: "gelbooru",
    idSearchUrl: "https://gelbooru.com/index.php?page=post&s=view&id=",
  },
]

