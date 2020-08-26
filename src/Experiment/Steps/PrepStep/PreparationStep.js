/**
 * 
 */
exp.PreparationStep = class extends(util.AbstractStep) {
    constructor(db) {
        super();
        this._db = db;
    }

    execute() {
        exp.HtmlGui.guiDiv().append("div").attr("id", "workspace").attr("class", "ac-workspace");
        this._db.EventsTable.add_new_row("Workspace element attached.");
        this.step_completed_signal.emit();
    }

}