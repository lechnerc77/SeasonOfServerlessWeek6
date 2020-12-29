import * as df from "durable-functions"

module.exports = df.entity(function (context) {

    const currentValue: string = <any>context.df.getState(() => "")

    switch (context.df.operationName) {
        case "reserve":
            const nameOfChocolate = context.df.getInput()
            context.df.setState(nameOfChocolate)
            break
        case "reset":
            context.df.setState("")
            break
        case "get":
            context.df.return(currentValue)
            break
    }
})