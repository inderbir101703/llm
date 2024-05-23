import OpenAI from "openai";
const openAi=new OpenAI({apiKey:process.env.OPENAI_API_KEY})

const context:OpenAI.Chat.Completions.ChatCompletionMessageParam[]=[{role:'system',content:'you are a helpful flight assitant'},
    {role:'user',content:'what flights are between FGH and NSD ?'}
]

function getFlight(departure:string,arrival:string){
  
    if(arrival=='NSD' && departure=='FGH')
     {console.log('2 flights are available')
     return '[1235,6894]'

     }
     else 
     return 'no'   

}
function bookFlight(flightNumber:string){
    console.log('...booking')
    return '34346'
}
async function flightHelper(){
    const response=await openAi.chat.completions.create({
        model:"gpt-3.5-turbo-0613",
        messages:context,
        tools:[{
            type:'function',
            function:{
                name:'getFlight',
                description:'get the flight number between two locations',
                parameters:{
                    type:'object',
                    properties:{departure:{
                        type:'string',
                        description:'location to where flight starts'
                    },
                    arrival:{
                        type:'string',
                        description:'location where is flight is going'
                    }
                      
                    },
            required:['departure','arrival']
                },
                  
                }
            
        },{
            type:'function',
            function:{
                name:'bookFlight',
                description:'book the flight and gives reservation number',
                parameters:{
                    type:'object',
                    properties:{
                        flightNumber:{
                            type:'string',
                            description:'flight number for which we are booking'
                        }
                    },
                    required:['flightNumber']
                }
            }
        }],
        tool_choice:'auto'
    })

    const invokeCall= response.choices[0].finish_reason=='tool_calls'
    const toolCall=response.choices[0].message.tool_calls![0]
   if(invokeCall){
    const callName=toolCall.function.name
    if(callName=='getFlight'){
        const rawArguments=toolCall.function.arguments
        const parsedArguments=JSON.parse(rawArguments)


        const toolResponse=getFlight(parsedArguments.departure,parsedArguments.arrival)
context.push(response.choices[0].message)
context.push({
   role:'tool',
   content:toolResponse,
   tool_call_id:toolCall.id 
})

    }
    if(callName=='bookFlight'){
        const rawArguments=toolCall.function.arguments
        const parsedArguments=JSON.parse(rawArguments)
        const toolResponse=bookFlight(parsedArguments.flightNumber)
        context.push(response.choices[0].message)
        context.push({role:'tool',content:toolResponse,tool_call_id:toolCall.id})
    }
   }
   const secondResponse=await openAi.chat.completions.create({model:'gpt-3.5-turbo-0613',messages:context})
   console.log(secondResponse.choices[0].message.content) 
}
process.stdin.addListener('data',async function(input){
    const userInput=input.toString().trim();
  context.push({role:'user',content:userInput})
await flightHelper()
})