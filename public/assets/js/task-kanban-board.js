(function () {
    "use strict";

    // Init SimpleBar
    ['new-tasks', 'todo-tasks', 'inprogress-tasks', 'inreview-tasks', 'completed-tasks'].forEach(id => {
        const el = document.getElementById(id);
        if (el) new SimpleBar(el, { autoHide: true });
    });

    document.addEventListener("DOMContentLoaded", () => {

        const containers = [
            document.querySelector('#new-tasks-draggable'),
            document.querySelector('#todo-tasks-draggable'),
            document.querySelector('#inprogress-tasks-draggable'),
            document.querySelector('#inreview-tasks-draggable'),
            document.querySelector('#completed-tasks-draggable'),
        ].filter(Boolean);

        // Init dragula and allow dragging ONLY .box items
        const drake = dragula(containers, {
            moves: function (el) {
                // Only cards are draggable; background image (and anything else) won't move
                return el.classList.contains('box');
            }
        });

        // === Function to toggle empty-state image + View More button ===
        const handleTaskNull = (container) => {
            if (!container) return;

            const nullBg = container.querySelector('.task-null-background');

            // view-more-button is a sibling inside the same .kanban-tasks
            const tasksWrapper = container.closest('.kanban-tasks');
            const viewMoreWrapper = tasksWrapper?.querySelector('.view-more-button');

            // All children except the null background
            const tasks = Array.from(container.children).filter(
                (child) => !child.classList.contains('task-null-background')
            );

            const isEmpty = tasks.length === 0;

            // Tailwind's "hidden" class
            if (nullBg) nullBg.classList.toggle('hidden', !isEmpty);
            if (viewMoreWrapper) viewMoreWrapper.classList.toggle('hidden', isEmpty);
        };

        const updateAllTaskStates = () => {
            containers.forEach(handleTaskNull);
        };

        // Update on drop
        drake.on('drop', updateAllTaskStates);

        // Initial state
        updateAllTaskStates();

        // Optional: if you dynamically add/remove tasks by JS
        setInterval(updateAllTaskStates, 1000);
    });

    /* multi select with remove button */
    const multipleCancelButton = new Choices('#choices-multiple-remove-button1', {
        allowHTML: true,
        removeItemButton: true,
    });
    const multipleCancelButton1 = new Choices('#choices-multiple-remove-button2', {
        allowHTML: true,
        removeItemButton: true,
    });

    /* TargetDate Picker */
    flatpickr("#targetDate", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
    });

    /* filepond */
    FilePond.registerPlugin(
        FilePondPluginImagePreview,
        FilePondPluginImageExifOrientation,
        FilePondPluginFileValidateSize,
        FilePondPluginFileEncode,
        FilePondPluginImageEdit,
        FilePondPluginFileValidateType,
        FilePondPluginImageCrop,
        FilePondPluginImageResize,
        FilePondPluginImageTransform
    );

    /* multiple upload */
    const MultipleElement = document.querySelector('.multiple-filepond');
    if (MultipleElement) {
        FilePond.create(MultipleElement);
    }

})();
