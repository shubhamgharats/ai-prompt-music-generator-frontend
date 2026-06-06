import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "~/server/db";
import { Polar } from "@polar-sh/sdk";
import { env } from "~/env";
import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";



const polarClient = new Polar({
    accessToken: env.POLAR_ACCESS_TOKEN,
    server: 'sandbox'
});

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
      emailAndPassword: { 
    enabled: true, 
  },
      plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "4856a8d3-b421-4e0b-900b-cea10548df46", 
                            slug: "small" 
                        },
                                                {
                            productId: "e8358861-13e2-410e-8733-2991ee4694fc", 
                            slug: "medium" 
                        },
                                                {
                            productId: "2fac6913-c7e3-4544-aeb3-eb7029031413", 
                            slug: "large" 
                        }
                    ],
                    successUrl: "/",
                    authenticatedUsersOnly: true
                }),
                portal(),
                webhooks({
                  secret: env.POLAR_WEBHOOK_SECRET,
                  onOrderPaid: async (order)=>{
                    const externalCustomerId = order.data.customer.externalId;

                    if(!externalCustomerId){
                      console.error("No external customer ID found.")
                      throw new Error("No external ID found.");
                    }

                    const productId = order.data.productId;

                    let creditsToAdd = 0;

                    switch(productId){
                      case "4856a8d3-b421-4e0b-900b-cea10548df46":
                        creditsToAdd = 10;

                      case "e8358861-13e2-410e-8733-2991ee4694fc":
                        creditsToAdd = 25;

                      case "2fac6913-c7e3-4544-aeb3-eb7029031413":
                        creditsToAdd = 50;
                    }

                    await db.user.update({
                      where:{id: externalCustomerId},
                      data:{
                        credits:{
                          increment: creditsToAdd,
                        }
                      }
                    })
                  }
                }),
            ],
        })
    ]
});