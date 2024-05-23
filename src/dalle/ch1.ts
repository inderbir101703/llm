import { writeFileSync } from "fs";
import OpenAI from "openai";
const openAi=new OpenAI({apiKey:process.env.OPENAI_API_KEY})


async function createImage(){
    const response=await openAi.images.generate({
        prompt:'A photo of a cat on  mat',
        model:"dall-e-2",
        style:'vivid',
        size:'256x256',
        quality:'standard',
        response_format:'b64_json',
        n:1
    })
    const rawImage=response.data[0].b64_json
    if(rawImage)
        writeFileSync('catMat.png',Buffer.from(rawImage,'base64'))
    console.log(response)
}
createImage();