import {MethodType} from "../HttpClient";
import {RequestWrapper} from "./Request";

export class AddParticipantRequest implements RequestWrapper {
    readonly body: string;
    constructor(body: { chatId: number, userId: string }) {
        this.body = JSON.stringify(body)
    }

    readonly endpoint: string = "/table/add_participant";
    readonly headers: HeadersInit = {
        "Content-Types": "application/json"
    };
    readonly methodType: MethodType = MethodType.POST;
}