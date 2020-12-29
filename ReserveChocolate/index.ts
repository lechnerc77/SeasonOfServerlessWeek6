import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as df from "durable-functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    if (req.body && req.body.name && req.body.type) {

        let responseMessage = ""

        const client = df.getClient(context)

        const reservationId = new df.EntityId("ReservationEntity", req.body.name)

        const reservationState = await client.readEntityState(reservationId)

        if (reservationState.entityExists === true && reservationState.entityState !== "") {

            responseMessage = `There is already a reservation for ${req.body.name}. Time for some healthy food 🥦`
        }
        else {

            const chocolateBoxId = new df.EntityId("ChocolateBoxEntity", req.body.type)

            const chocolateState = await client.readEntityState(chocolateBoxId)

            if (chocolateState.entityExists === true && chocolateState.entityState === 0) {

                responseMessage = `The chocolate ${req.body.type} is already reserved - take a cookie 🍪 in the meantime `

            }

            else {

                client.signalEntity(chocolateBoxId, "takeChocolate")
                client.signalEntity(reservationId, "reserve", req.body.type)

                responseMessage = `The reservation for ${req.body.name} was executed - a piece of ${req.body.type} 🍫 is waiting for you `
            }

        }

        context.res = {
            status: 200,
            body: responseMessage
        }


    }
    else {
        context.res = {
            status: 400,
            body: "🛑 Pass a valid JSON body with name and type of chocolate 🛑"
        };
    }

}
export default httpTrigger