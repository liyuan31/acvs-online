/**
 * Mouse Click Foraging task
 */
exp.MCF1 = class extends exp.ExperimentKernel {
    constructor() {

        super();
        //
        // Set up the database
        //
        this._db.add_new_table("EventsTable");
        this._db.EventsTable.add_new_column("Event");

        this._db.add_new_table("ExperimentTable");
        this._db.ExperimentTable.add_new_column("BlockNumber");
        this._db.ExperimentTable.add_new_column("AllTrialsData");

        this._db.add_new_table("_user_data");

        this.add_new_step(new exp.ConsentStep(this._db));
        this.add_new_step(new exp.CheckBrowserStep(this._db));

        const INSTR_ROOT = "https://exp.leberatory.org/files/instr/mcf-1/";
        const INSTR_FILE_EXT = "jpeg";

        // Get determine version based on counterbalance id
        // Possible values for version_id: 1, 0
        const version_id = parseInt(util.Util.get_cb_id()) % 2;

        if (version_id === 1) {
            this.add_new_step(new exp.BriefingStep(this._db, [`<img src=${INSTR_ROOT}1.${INSTR_FILE_EXT}>`], " "));
            this.add_new_step(new exp.MCFBlock(this._db, 0, new disp.MCFDisplayGenerator(5, "red", "green"), 1));
            this.add_new_step(new exp.BriefingStep(this._db, [`<img src=${INSTR_ROOT}2.${INSTR_FILE_EXT}>`], " "));
            this.add_new_step(new exp.MCFBlock(this._db, 1, new disp.MCFDisplayGenerator(20, "red", "green"), 1));
        } else if (version_id === 0) {
            this.add_new_step(new exp.BriefingStep(this._db, [`<img src=${INSTR_ROOT}3.${INSTR_FILE_EXT}>`], " "));
            this.add_new_step(new exp.MCFBlock(this._db, 0, new disp.MCFDisplayGenerator(5, "green", "red"), 0));
            this.add_new_step(new exp.BriefingStep(this._db, [`<img src=${INSTR_ROOT}4.${INSTR_FILE_EXT}>`], " "));
            this.add_new_step(new exp.MCFBlock(this._db, 1, new disp.MCFDisplayGenerator(20, "green", "red"), 0));
        }


        this.add_new_step(new exp.SubmitDataStep(this._db,
            "https://exp.leberatory.org/experiments/mcf-1/receive.php"));
    }
}
