import * as df from "durable-functions"

module.exports = df.entity(function (context) {

    const currentValue: number = <any>context.df.getState(() => 2)

    switch (context.df.operationName) {
        case "takeChocolate":
            context.df.setState(currentValue - 1)
            break
        case "undoTakeChocolate":
            context.df.setState(currentValue + 1)
            break
        case "reset":
            context.df.setState(2)
            break
        case "get":
            context.df.return(currentValue)
            break
    }
})