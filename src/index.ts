import OpenAI from "openai";
import { encoding_for_model } from "tiktoken";
const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY})
const encoder=encoding_for_model('gpt-3.5-turbo')
const MAX_TOKENS=700;
const context:OpenAI.Chat.Completions.ChatCompletionMessageParam[]=[{role:'system',content:'you are a chatbot'}]



async function createChatCompletion(){
    const response=await openai.chat.completions.create({
        model:'gpt-3.5-turbo',
        messages:context
    })
    if(response.usage && response.usage.total_tokens>MAX_TOKENS){
        deleteOlderMessages()
    }
    context.push(response.choices[0].message)
console.log(response.choices[0].message.content)
}

process.stdin.addListener('data',async function(input){
    const userInput=input.toString().trim();
  context.push({role:'user',content:userInput})
await createChatCompletion()
})

function deleteOlderMessages(){
    let contextLength = getContextLength();
    while (contextLength > MAX_TOKENS) {
        for(let i= 0; i < context.length; i++) {
            const message = context[i];
            if (message.role != 'system') {
                context.splice(i, 1);
                contextLength = getContextLength();
                console.log('New context length: '+ contextLength);
                break;
            }
        }
    }
}
function getContextLength(){
    let length = 0;
    context.forEach((message) => {
        if (typeof message.content == 'string') {
            length += encoder.encode(message.content).length;
        } else if (Array.isArray(message.content)) {
            message.content.forEach((messageContent) => {
                if (messageContent.type == 'text') {
                    length += encoder.encode(messageContent.text).length;
                }
            })
        }
    })
    return length
}