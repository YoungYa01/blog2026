import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";
import { Image } from "@heroui/image";
import { useNavigate } from "react-router-dom";
import { startTransition } from "react";
import { HiMiniSquares2X2 } from "react-icons/hi2";
import { addToast, closeAll } from "@heroui/toast";

import { siteConfig } from "@/config/site.ts";
import { GithubIcon } from "@/components/Icons/icons.tsx";
import LogoImage from "@/asset/logobai.png";
import { CHANNEL_RECEIVE_KEY, CHANNEL_SEND_KEY } from "@/utils/const.ts";

export const Navbar = () => {
  const navigate = useNavigate();

  const channel = new BroadcastChannel(CHANNEL_SEND_KEY);

  const handleRoute2Admin = () => {
    let isAdminAlive = false;

    channel.postMessage(CHANNEL_SEND_KEY);

    const messageHandler = (event: MessageEvent) => {
      if (event.data === CHANNEL_RECEIVE_KEY) {
        isAdminAlive = true;
        closeAll();
        addToast({
          title: "It has been opened.",
          color: "success",
        });
      }
    };

    channel.addEventListener("message", messageHandler);
    setTimeout(() => {
      channel.removeEventListener("message", messageHandler);
      if (!isAdminAlive) {
        window.open(window.location.origin + "/admin", "_blank");
      }
    }, 200);
  };

  return (
    <HeroUINavbar
      shouldHideOnScroll
      className={"bg-transparent w-screen"}
      maxWidth="xl"
      position="sticky"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <Image height={36} src={LogoImage} width={50} />
            <p className="font-bold text-inherit">YoungYa</p>
          </Link>
        </NavbarBrand>
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Button
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                variant={"light"}
                onPress={() => startTransition(() => navigate(item.href))}
              >
                {item.label}
              </Button>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        {/*<NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>*/}
        {/*<NavbarItem className="hidden md:flex">*/}
        {/*  <Button*/}
        {/*    isExternal*/}
        {/*    as={Link}*/}
        {/*    className="text-sm font-normal text-default-600"*/}
        {/*    color="danger"*/}
        {/*    startContent={<HeartFilledIcon className="text-danger" />}*/}
        {/*    variant="bordered"*/}
        {/*  >*/}
        {/*    {parseInt(String(Math.random() * 1000))}*/}
        {/*  </Button>*/}
        {/*</NavbarItem>*/}
        <NavbarItem className="hidden sm:flex gap-2">
          <a
            href={siteConfig.links.github}
            rel="noreferrer"
            target={"_blank"}
            title="GitHub"
          >
            <GithubIcon className="text-default-500" />
          </a>
        </NavbarItem>
        <NavbarItem className="hidden sm:flex gap-2">
          <Button isIconOnly variant={"light"} onPress={handleRoute2Admin}>
            <HiMiniSquares2X2 />
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <a href={siteConfig.links.github} rel="noreferrer" target={"_blank"}>
          <GithubIcon className="text-default-500" />
        </a>
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {/*{searchInput}*/}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link color={"foreground"} href={item.href} size="lg">
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
