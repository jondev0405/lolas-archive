import { extractMemories } from "../lib/extract";

const t = "My grandfather always made bibingka on Christmas Eve. He would wake up at four in the morning to light the charcoal. He used to say, 'Food is how we say I love you.' He hummed Dahil Sa Iyo while he cooked.";
console.time("extract");
extractMemories(t).then((r) => {
  console.timeEnd("extract");
  console.log(JSON.stringify(r, null, 2));
});