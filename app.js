/**
 * Dependency Radar prototype.
 *
 * Four product screens (upstream email -> dependency review -> downstream
 * email -> impact brief) rendered inside a browser frame. The dark harness
 * around that frame is demo scaffolding: persona lanes, step rail, narration.
 */

const evidence_sources_supporting_the_inference = [
  {
    source_name: "Checkout Redesign PRD",
    short_summary: "“Replace legacy payment states…”",
    expanded_excerpt:
      "“Replace legacy payment states with a single consolidated payment_status field and sub-states. Legacy payment_pending and payment_failed values stop being emitted at rollout.”",
  },
  {
    source_name: "Revenue Metrics Spec",
    short_summary: "References payment_pending and payment_failed",
    expanded_excerpt:
      "“checkout_conversion = completed_orders / (completed_orders + payment_pending + payment_failed). payment_failure_rate reads directly from the payment_failed status.”",
  },
  {
    source_name: "Checkout Eng Sync",
    short_summary: "“Targeting September 21 rollout”",
    expanded_excerpt:
      "Eng sync notes, Aug 26: “We’re targeting September 21 for rollout. Whether we dual-write the legacy states during the transition is still open.”",
  },
];

/** Which persona owns each step, plus the harness framing for that step. */
const presentation_details_by_step_number = {
  1: {
    persona_identifier: "upstream_pm_maya",
    browser_url: "mail.company.com/inbox",
    step_counter: "Step 1 of 4",
    experience_label: "Now viewing Maya’s Experience (the upstream PM)",
  },
  2: {
    persona_identifier: "upstream_pm_maya",
    browser_url: "radar.company.com/dependencies/482",
    step_counter: "Step 2 of 4",
    experience_label: "Now viewing Maya’s Experience (the upstream PM)",
  },
  3: {
    persona_identifier: "downstream_pm_leo",
    browser_url: "mail.company.com/inbox",
    step_counter: "Step 3 of 4",
    experience_label: "Now viewing Leo’s Experience (the downstream PM)",
  },
  4: {
    persona_identifier: "downstream_pm_leo",
    browser_url: "radar.company.com/impacts/482",
    step_counter: "Step 4 of 4",
    experience_label: "Now viewing Leo’s Experience (the downstream PM)",
  },
};

let most_recently_viewed_upstream_step_number = 1;
let most_recently_viewed_downstream_step_number = 3;

/** Renders the clickable evidence chips, which expand an excerpt inline. */
function render_evidence_lists_on_every_screen() {
  document.querySelectorAll("[data-evidence-list]").forEach((evidence_list_element) => {
    evidence_list_element.innerHTML = evidence_sources_supporting_the_inference
      .map(
        (evidence_source, evidence_source_index) => `
        <div class="evidence_item">
          <button class="evidence_chip" data-evidence-index="${evidence_source_index}">
            <span class="evidence_chip_source">${evidence_source.source_name}</span>
            <span class="evidence_chip_summary"> · ${evidence_source.short_summary}</span>
          </button>
          <p class="evidence_excerpt hidden">${evidence_source.expanded_excerpt}</p>
        </div>`
      )
      .join("");
  });
}

function show_toast_message(toast_message_text) {
  const toast_element = document.getElementById("toast");
  toast_element.textContent = toast_message_text;
  toast_element.classList.remove("hidden");
  window.clearTimeout(show_toast_message.pending_timeout_identifier);
  show_toast_message.pending_timeout_identifier = window.setTimeout(
    () => toast_element.classList.add("hidden"),
    4000
  );
}

function show_status_note(status_note_element, status_note_text) {
  status_note_element.textContent = status_note_text;
  status_note_element.classList.remove("hidden");
}

/** Shows presentation context outside the framed product experience. */
function show_setup_page() {
  document.getElementById("setup_page").classList.remove("hidden");
  document.getElementById("prototype_frame").classList.add("hidden");
  document.querySelector(".harness_setup_button").classList.add("is_active");
  document.querySelectorAll(".harness_step_button").forEach((harness_step_button_element) => {
    harness_step_button_element.classList.remove("is_active");
  });
  document.querySelectorAll(".harness_lane").forEach((harness_lane_element) => {
    harness_lane_element.classList.remove("is_active");
  });

  const harness_narration_element = document.getElementById("harness_narration");
  harness_narration_element.classList.remove("hidden");
  harness_narration_element.textContent = "Prototype setup · context before the flow";
  harness_narration_element.dataset.persona = "setup";
}

/**
 * Moves the prototype to a step. Persona always follows the step, so panelists
 * can click either control and stay in a consistent state.
 */
function go_to_step(target_step_number) {
  const presentation_details = presentation_details_by_step_number[target_step_number];
  if (presentation_details.persona_identifier === "upstream_pm_maya") {
    most_recently_viewed_upstream_step_number = target_step_number;
  } else {
    most_recently_viewed_downstream_step_number = target_step_number;
  }

  document.getElementById("setup_page").classList.add("hidden");
  document.getElementById("prototype_frame").classList.remove("hidden");
  document.getElementById("harness_narration").classList.add("hidden");
  document.querySelector(".harness_setup_button").classList.remove("is_active");
  document.querySelectorAll(".screen").forEach((screen_element) => {
    screen_element.classList.toggle("hidden", screen_element.dataset.step !== String(target_step_number));
  });
  document.querySelectorAll(".harness_step_button").forEach((harness_step_button_element) => {
    harness_step_button_element.classList.toggle("is_active", harness_step_button_element.dataset.step === String(target_step_number));
  });
  document.querySelectorAll(".harness_lane").forEach((harness_lane_element) => {
    harness_lane_element.classList.toggle("is_active", harness_lane_element.dataset.personaLane === presentation_details.persona_identifier);
  });

  document.getElementById("browser_url").textContent = presentation_details.browser_url;
  const prototype_frame_element = document.getElementById("prototype_frame");
  prototype_frame_element.dataset.persona = presentation_details.persona_identifier;
  document.getElementById("persona_experience_label").textContent = presentation_details.experience_label;
  document.getElementById("persona_step_counter").textContent = presentation_details.step_counter;
}

const handlers_by_action_name = {
  open_setup: () => show_setup_page(),
  open_dependency_review: () => go_to_step(2),
  open_downstream_impact_brief: () => go_to_step(4),

  approve_outreach: () => {
    show_toast_message("Revenue Analytics has been invited to review this dependency.");
    go_to_step(3);
  },

  toggle_edit_impact: () =>
    document.querySelector('[data-edit-impact="upstream"]').classList.toggle("hidden"),

  save_impact_edit: () => {
    document.querySelector('[data-edit-impact="upstream"]').classList.add("hidden");
    show_status_note(
      document.getElementById("upstream_status_note"),
      "Impact summary updated. Revenue Analytics will see your version in the brief."
    );
  },

  mark_already_coordinated: () =>
    show_status_note(
      document.getElementById("upstream_status_note"),
      "Marked as already coordinated. We’ll skip outreach and keep tracking the dependency."
    ),

  dismiss_dependency: () =>
    show_status_note(
      document.getElementById("upstream_status_note"),
      "Dependency dismissed. Revenue Analytics will not be notified."
    ),

  confirm_impact: () =>
    show_status_note(
      document.getElementById("downstream_status_note"),
      "Impact confirmed. Checkout Platform will see your response before finalizing the change."
    ),

  flag_additional_risk: () =>
    show_status_note(
      document.getElementById("downstream_status_note"),
      "Risk flagged. Checkout Platform will see your note alongside the impact summary."
    ),

  request_discussion: () =>
    show_status_note(
      document.getElementById("downstream_status_note"),
      "Discussion requested. Checkout Platform has been asked to schedule time before the design is finalized."
    ),

  mark_not_impacted: () =>
    show_status_note(
      document.getElementById("downstream_status_note"),
      "Marked as not impacted. We’ll use this to tune future dependency detection."
    ),
};

document.addEventListener("click", (click_event) => {
  const clicked_element = click_event.target.closest(
    "[data-action], [data-step], [data-persona], [data-evidence-index], [data-feedback-value]"
  );
  if (!clicked_element) return;
  if (clicked_element.tagName === "A") click_event.preventDefault();

  if (clicked_element.dataset.step) {
    go_to_step(Number(clicked_element.dataset.step));
    return;
  }

  if (clicked_element.dataset.persona) {
    go_to_step(
      clicked_element.dataset.persona === "downstream_pm_leo"
        ? most_recently_viewed_downstream_step_number
        : most_recently_viewed_upstream_step_number
    );
    return;
  }

  if (clicked_element.dataset.evidenceIndex) {
    clicked_element.nextElementSibling.classList.toggle("hidden");
    return;
  }

  if (clicked_element.dataset.feedbackValue) {
    const feedback_control_element = clicked_element.closest("[data-feedback-group]");
    feedback_control_element
      .querySelectorAll(".feedback_button")
      .forEach((feedback_button_element) => feedback_button_element.classList.remove("is_selected"));
    clicked_element.classList.add("is_selected");
    show_status_note(
      document.querySelector(
        `[data-feedback-note="${feedback_control_element.dataset.feedbackGroup}"]`
      ),
      "Thanks — your feedback is recorded and will tune how we score this kind of dependency."
    );
    return;
  }

  handlers_by_action_name[clicked_element.dataset.action]?.();
});

render_evidence_lists_on_every_screen();
show_setup_page();
