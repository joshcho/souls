import { externalDialog } from "socialagi";
import { MentalProcess } from "soul-engine";

function split(s) {
  // split("간") => [0, 0, 4]
  const startValue = s.charCodeAt(0) - 0xAC00;
  const jong = startValue % 28;
  const jung = ((startValue - jong) / 28) % 21;
  const cho = (((startValue - jong) / 28) - jung) / 21;
  return [cho, jung, jong];
}

const charMap = {
  // 'ㄱ': 'ㅋ' 로 하면 안됩니다. split으로 나누기 때문에 중성까지 포함시켜야 합니다.
  // 중성 ('ㅏ') 는 의미 없습니다.
  '가': '카',
  '다': '타',
  '바': '파',
  '빠': '파',
  '자': '차',
  '짜': '차',
};


const charCodeMap = {};

// charCodeMap 을 charMap을 활용해서 만듭니다. split 에서 초성만 사용함.
for (let key in charMap) {
  const [choKey] = split(key);
  const [choValue] = split(charMap[key]);
  charCodeMap[choKey] = choValue;
} // charCodeMap {1: 3, 5: 7} 이런식으로 populate됨

// 여기서 Char은 1-length string 을 뜻합니다.
function jinheeChar(str) {
//  assert(str.length == 1);
  let [cho, jung, jong] = split(str);

  if (charCodeMap.hasOwnProperty(cho)) {
    cho = charCodeMap[cho];
  }

  // 초성, 중성, 종성 이용하여 다시 복구
  return String.fromCharCode(0xAC00 + ((cho * 21) + jung) * 28 + jong).toString();
}

const gainsTrustWithTheUser: MentalProcess = async ({ step: initialStep, subroutine: { useActions } }) => {
  const { speak  } = useActions()

  const { stream, nextStep } = await initialStep.next(
    externalDialog("Talk to the user trying to gain trust and learn about their inner world."),
    { stream: true, model: "quality" }
  );

  async function* transformStream(asyncIterable, func) {
    // apply func transformation to asyncIterable
    for await (let chunk of asyncIterable) {
      yield chunk.split('').map(func).join('');
    }
  }

//  speak(stream);
  speak(transformStream(stream, jinheeChar));
  return nextStep
}

export default gainsTrustWithTheUser
