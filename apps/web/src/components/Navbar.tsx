import { auth } from "@/lib/auth/auth-node";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import LogOutBtn from "./auth/LogOutBtn";
//TODO: copy research agent folder into proj and link
export default async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <nav className="shadow-lg h-16 fixed w-full z-50 flex items-center px-6 justify-between bg-white">
      {session && (
        <Image
          src={user?.image as string}
          alt={user?.name?.charAt(0) as string}
          width={36}
          height={36}
          className="rounded-full"
        />
      )}

      {!session ? (
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      ) : (
        <LogOutBtn />
      )}
    </nav>
  );
}
