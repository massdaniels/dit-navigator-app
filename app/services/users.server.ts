// import type { LoginForm, RegisterForm } from "~/types/types.server";
// import bcrypt from "bcryptjs";
// import { prisma } from "./prisma.server";
// import { createCookieSessionStorage, json } from "@remix-run/node";
// import { redirect } from "@remix-run/node";


// export const createUser = async (user: RegisterForm) => {
//     const passwordHash = await bcrypt.hash(user.password, 10)
//     const newUser = await prisma.users.create({
//         data: {
//             email: user.email,
//             password: passwordHash,
//             firstName: user.firstName,
//             lastName: user.lastName
//         }
//     })

//     return { id: newUser.id, email: user.email }
// }


