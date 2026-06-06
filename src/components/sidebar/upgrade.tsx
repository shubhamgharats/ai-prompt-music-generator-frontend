"use client"
import { authClient } from "~/lib/auth-client"
import { Button } from "../ui/button"

export default function Upgrade(){

const upgrade = async ()=>{
    await authClient.checkout({
        products:[
            "4856a8d3-b421-4e0b-900b-cea10548df46",
            "e8358861-13e2-410e-8733-2991ee4694fc",
            "2fac6913-c7e3-4544-aeb3-eb7029031413",

        ]
    })
}

    return <Button onClick={upgrade} variant="outline" size="sm" className="ml-2 cursor-pointer text-orange-400"
    >Upgrade</Button>
}


