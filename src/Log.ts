const isDebugMode = false

function show(...args: any[]) {
    if(isDebugMode)
        args.forEach(arg => console.log(arg))
}

export const Log = {
    show
}