/**
 * A trial class for Mouse Click Foraging task.
 */
exp.MCFTrial = class extends exp.AbstractTrial {

    constructor(stimuli, targ_sq_color, targ_cir_color) {

        super();

        this._stimuli = stimuli;
        this._targ_sq_color = targ_sq_color;
        this._targ_cir_color = targ_cir_color;

        this._trial_completed_signal = new util.Signal();

        this._display_widget = new disp.DisplayWidget(util.Workspace.workspace(), "0 0 100 80", "125vmin");

        // Create an object to store the data for this Trial
        this._trial_data = { "trial_start_timestamp": performance.now() };

        // Trial parameters
        this._fixation_duration = 1000;   // duration fixation cross is shown
        this._feedback_duration = 1500;
        this._max_targ_click_interval = 10000;    // max time allowed between two target clicks before trial resets
        this._err_msg_duration = 3000;  // duration of error message (wrong targ click or timed out) appears on screen

        // Trial runtime variables
        this._n_targ_left = 40;
        this._n_run = 1;
        this._response_sequence = [];
        this._response_timestamps = [];
        this._response_locations = [];
        this._n_wrong_attempt = 0;

    }


    _process_click(data) {
        // Clear existing timeouts
        util.Util.clear_timeouts();
        // Determine if this object is a target
        if (data.className.slice(0, 4) === "targ") {
            // If it is, record the timestamp of this target click
            this._response_timestamps.push(performance.now());
            // Record target position (x & y or cx & cy, depending on the shape)
            if (data.x !== undefined) {
                this._response_locations.push([parseFloat(data.x).toFixed(2), parseFloat(data.y).toFixed(2)]);
            } else {
                this._response_locations.push([parseFloat(data.cx).toFixed(2), parseFloat(data.cy).toFixed(2)]);
            }
            // Determine if this is a switch of target type (only when this is not the first target in the trial)
            if (this._response_sequence.length > 0 &&
                data.className.slice(5, 7) !== this._response_sequence[this._response_sequence.length - 1].slice(5, 7)) {
                this._n_run++;
            }
            // Record target identity in the response sequence
            this._response_sequence.push(`${data.className}_${data.id}`);
            // Decrement remaining target count
            this._n_targ_left--;
            // Remove the object and its background object
            d3.select(`#${data.id}`).remove();
            if (data.id[data.id.length-1] !== 'g') {
                d3.select(`#${data.id}_bg`).remove();
            } else {
                d3.select(`#${data.id.slice(0, data.id.length-3)}`).remove();
            }
            // Create a timeout for next object
            this._create_trial_timeout(this._max_targ_click_interval);
        } else {
            // If the clicked object is not a target, clear the display
            this._display_widget.clear();
            // Play a beep sound
            util.Util.play_beep_sound();
            // Show feedback
            this._display_widget.show_feedback(
                "Oops, remember the targets are " + this._targ_sq_color + " squares " +
                "and " + this._targ_cir_color + " circles. " +
                "Let's try again!", 50, 40);
            // Increment wrong attempt count
            this._n_wrong_attempt++;
            // After 3 seconds, reset trial parameters show the display again
            this._reset_trial(this._err_msg_duration);
        }
        // Check if there is any target left
        if (this._n_targ_left === 0) {
            this._trial_data.trial_completed_timestamp = performance.now();
            this._end_trial();
        }
    }

    _reset_trial_params() {
        this._response_sequence = [];
        this._response_timestamps = [];
        this._n_targ_left = 40;
        this._n_run = 1;
    }

    /**
     * Create a timeout such that after certain time, the display refreshes to
     * the original state and trial parameters reset.
     * @param {number} t : time (ms) until reset
     */
    _reset_trial(t) {
        setTimeout(() => {
            this._reset_trial_params();
            this._render();
        }, t)
    }

    _end_trial() {
        // Record trial result
        this._trial_data.run_number = this._n_run;
        this._trial_data.run_length = 40/this._n_run;
        this._trial_data.n_wrong_attempt = this._n_wrong_attempt;
        this._trial_data.response_sequence = this._response_sequence;
        this._trial_data.response_timestamps = this._response_timestamps;
        this._trial_data.response_locations = this._response_locations;
        this._trial_data.rt = (this._trial_data.trial_completed_timestamp - this._trial_data.stimuli_rendered_timestamp)/1000;
        console.log(this._trial_data);
        this._display_widget.clear();
        setTimeout((() => {
            this._display_widget = this._display_widget.destroy();
            this._trial_completed_signal.emit(this._trial_data);
            util.Util.clear_timeouts();
        }).bind(this), this._feedback_duration);
    }

    /**
     * Render a trial display. Called at the beginning of a trial or when
     * a non-target is clicked and the display needs resetting.
     */
    _render() {
        const fixation = new disp.DisplayDataset();
        fixation.add_a_text(new disp.Text(
            '+', 50, 40, 'white', 3, undefined, "fixation-cross-center"
        ));
        util.Util.clear_timeouts();
        this._display_widget.clear();
        this._display_widget.draw(fixation);
        setTimeout(() => {
            this._display_widget.clear();
            this._display_widget.draw(this._stimuli);
            d3.selectAll("rect, circle").on("click", d => this._process_click(d));
            this._trial_data.stimuli_rendered_timestamp = performance.now();
            // Create a timeout that resets the trial after 10s of no response
            this._create_trial_timeout(this._max_targ_click_interval);
        }, this._fixation_duration);
    }

    /**
     * Create a timeout. After certain time, reset trial parameters and redraw
     * the display.
     * @param {number} t : time (ms) until trial resets
     */
    _create_trial_timeout(t) {
        setTimeout(() => {
            this._display_widget.show_feedback("Please click a target as quickly as you can!");
            this._reset_trial(this._err_msg_duration);
        }, t)
    }

    run_trial() {

        this._display_widget.clear();
        util.Workspace.clear_message();

        this._render();
    }

    set_trial_number(n) {
        this._trial_data.blockTrial = n;
    }

    set_block_number(n) {
        this._trial_data.blockNumber = n;
    }

    get_trial_completed_signal() {
        return this._trial_completed_signal;
    }

}
