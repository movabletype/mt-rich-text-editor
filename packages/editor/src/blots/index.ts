import { HrBlot } from "./hr";
import { PreBlot } from "./pre";
import { ImageBlot } from "./image";
import { GenericBlockBlot } from "./generic-block";
import Quill from "quill";

Quill.register(HrBlot);
Quill.register(PreBlot);
Quill.register(ImageBlot);
Quill.register(GenericBlockBlot);
