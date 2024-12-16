import { HrBlot } from "./hr";
import { PreBlot } from "./pre";
import { ImageBlot } from "./image";
import Quill from "quill";

Quill.register(HrBlot);
Quill.register(PreBlot);
Quill.register(ImageBlot);
