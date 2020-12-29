import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as df from "durable-functions"

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    if (req.query && req.query.name) {

        let responseMessage = ""

        const client = df.getClient(context)

        const reservationId = new df.EntityId("ReservationEntity", req.query.name)

        const reservationState = await client.readEntityState(reservationId);

        if (reservationState.entityExists === false || reservationState.entityState === "") {

            responseMessage = `There is no reservation for ${req.query.name} 🤷‍♂️`
        }
        else {

            if (req.method === "GET") {

                responseMessage = `The chocolate reserved for ${req.query.name} is: ${reservationState.entityState} 🍫`

            }

            else if (req.method === "DELETE") {

                client.signalEntity(reservationId, "reset")

                const chocolateBoxId = new df.EntityId("ChocolateBoxEntity", <any>reservationState.entityState)
                client.signalEntity(chocolateBoxId, "undoTakeChocolate")

                responseMessage = `The reservation for ${req.query.name} was reset - your chocolate bucket is empty. You should reserve something now 🛒`

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
            body: "🛑 Pass a name as query parameter to check your reservation 🛑"
        };
    }

}
export default httpTrigger