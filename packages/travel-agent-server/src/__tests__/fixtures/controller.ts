import { Controller } from "../../classes/controller";
import { get } from "../../classes/decorators";

export default class TestController extends Controller {
    @get("/show-stuff")
    async show() {
        this.response.json({
            home: "IS THIS WORKING?",
        });
    }
}
