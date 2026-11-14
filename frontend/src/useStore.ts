import { useContext } from "react";
import { Ctx } from "./ctx";

export const useStore = () => useContext(Ctx);
