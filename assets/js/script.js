// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Todo: create a function to generate a unique task id
function generateTaskId() {
    let id = nextId;
    nextId++;
    localStorage.setItem("nextId", JSON.stringify(nextId));
    return id;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    let dueDate = dayjs(task.dueDate);
    let today = dayjs().startOf('day');
    let cardColor = 'bg-white';

    if (dueDate.isBefore(today, 'day') && task.status != "done") {
        cardColor = 'bg-danger';
    } else if (dueDate.isSame(today, 'day') && task.status != "done") {
        cardColor = 'bg-warning';
    }

    let card = $(`
        <div class="card border-secondary mb-3 mx-auto ${cardColor}" data-id="${task.id}" style="max-width: 18rem;">
            <h5 class="card-header">${task.name}</h5>
            <div class="card-body">
                <p class="card-text">${task.description}</p>
                <p class="card-text"><small class="text-muted">Due: ${task.dueDate}</small></p>
                <button class="btn btn-danger btn-sm delete-task">Delete</button>
            </div>
        </div>
    `);
    return card;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    // Clear the task columns
    $('#todo-cards').empty();
    $('#in-progress-cards').empty();
    $('#done-cards').empty();

    taskList.forEach(task => {
        let card = createTaskCard(task);
        switch (task.status) {
            case 'in-progress':
                $('#in-progress-cards').append(card);
                break;
            case 'done':
                $('#done-cards').append(card);
                break;
            default:
                $('#todo-cards').append(card);
                break;
        }
    });

    $(".border-secondary").draggable(
        {start: function(event, ui) {
            ui.helper.css('z-index', 1000);
        }
    });
    $(".lane").droppable({
        drop:handleDrop
    });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    // Prevent the default behavior
    event.preventDefault();

    let taskName = $("#task-name").val();
    let description = $("#task-description").val();
    let dueDate = $("#datepicker").val();
    let task = {
        id: generateTaskId(),
        name: taskName,
        description: description,
        dueDate: dueDate,
        status: "to-do"
        };
    taskList.push(task);

    localStorage.setItem("tasks", JSON.stringify(taskList));

    renderTaskList();

    // Clear form fields
    $('#task-name').val('');
    $('#task-description').val('');
    $('#datepicker').val('');
    $('#formModal').modal('hide');
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
    // Prevent the default behavior
    event.preventDefault();

    let card = $(event.target).closest('.card');
    let taskId = card.data('id');

    // Find the index of the task to be removed
    let taskIndex = taskList.findIndex(task => task.id === taskId);

    // Remove the task from the task list using splice
    if (taskIndex !== -1) {
        taskList.splice(taskIndex, 1);
    }

    // Update the tasks in localStorage
    localStorage.setItem("tasks", JSON.stringify(taskList));

    // Remove the card element from the DOM
    card.remove();
}

//Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    let card = ui.draggable;
    let taskId = card.data('id');
    let newStatus = $(this).attr('id').replace('-cards', '');

    // Find the task in the task list and update its status
    let task = taskList.find(task => task.id === taskId);
    if (task) {
        task.status = newStatus;

        // Update the tasks in localStorage
        localStorage.setItem("tasks", JSON.stringify(taskList));
        
        // Re-render the task list
        renderTaskList();
    }
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    $("#datepicker").datepicker();
    renderTaskList();
    $("#taskForm").submit(handleAddTask);
    $(document).on('click', '.delete-task', handleDeleteTask);
});
