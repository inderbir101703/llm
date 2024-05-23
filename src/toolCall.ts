import OpenAI from "openai";

function getTimeOfDay(){
    return '5:45'
}
function getOrderStatus(orderId:string){
    console.log(`getting the order of,${orderId}`)
const orderNumber =parseInt(orderId)
if(orderNumber%2===0)
    return 'IN_PROGRESS'
else
return 'IS_COMPLETED'

}
const openAi=new OpenAI({apiKey:process.env.OPENAI_API_KEY})
const context:OpenAI.Chat.Completions.ChatCompletionMessageParam[]=[{role:'system',
content:'you are a helpful assistant that gives information about the time of day'},
{role:'user',
    content:'What is status of 1235?'
}]

async function toolCall(){
    const response=await openAi.chat.completions.create({
        model:'gpt-3.5-turbo-0613',
        messages:context,
        tools:[{
             type:'function',
             function:{
                name:'getTimeOfDay',
                description:'get the time of day'
             }
        },{
            type:'function',
            function:{
                name:'getOrderStatus',
                description:'Returns the order of order id',
                parameters:{type:'object',
                properties:{
                    orderId:{
            type:'string',
            description:'th id of the order to get the status of '
                    }
                },
                  required:['orderId']  
                }
            }
        }],
        tool_choice:'auto'
    })

    const willInvokeFunction=response.choices[0].finish_reason=='tool_calls'
    const toolCall=response.choices[0].message.tool_calls![0]

if(willInvokeFunction){
    const toolName=toolCall.function.name
 

    if(toolName=='getTimeOfDay'){
        const toolResponse=getTimeOfDay()
        context.push(response.choices[0].message)
        context.push({role:'tool',content:toolResponse,tool_call_id:toolCall.id})
    }
    if(toolName=="getOrderStatus"){
        const rawArgument=toolCall.function.arguments;
        const parsedArguments=JSON.parse(rawArgument)
        const toolResponse=getOrderStatus(parsedArguments.orderId);
        context.push(response.choices[0].message)
        context.push({
            role:'tool',
            content:toolResponse,
            tool_call_id:toolCall.id
        })
    }
}

const secondResponse=await openAi.chat.completions.create({
    model:"gpt-3.5-turbo-0613",
    messages:context

})
    console.log(secondResponse.choices[0].message.content,'hehe')
    console.log(context)
}
toolCall()