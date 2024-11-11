import createTask from '@salesforce/apex/TaskController.createTask';
import getTasksForUser from '@salesforce/apex/TaskController.getTasksForUser';
import updateTaskStatus from '@salesforce/apex/TaskController.updateTaskStatus';
import { LightningElement, track, wire } from 'lwc';

export default class TaskManager extends LightningElement {
    @track tasks;
    @track priority = 'Low';
    priorityOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' }
    ];

    columns = [
        { label: 'Task Name', fieldName: 'Name' },
        { label: 'Description', fieldName: 'Description__c' },
        { label: 'Due Date', fieldName: 'Due_Date__c' },
        { label: 'Priority', fieldName: 'Priority__c' },
        { label: 'Status', fieldName: 'Status__c' },
        {
            type: 'button',
            typeAttributes: { label: 'Mark as Completed', name: 'mark_as_completed', variant: 'brand' },
        },
        {
            type: 'button',
            typeAttributes: { label: 'Mark as In Progress', name: 'mark_as_in_progress', variant: 'neutral' },
        }
    ];

    @wire(getTasksForUser, { priority: '$priority', status: null })
    wiredTasks({ error, data }) {
        if (data) {
            this.tasks = data;
        } else if (error) {
            console.error(error);
        }
    }

    handleCreateTask(event) {
        const form = this.template.querySelector('lightning-record-edit-form');
        const fields = form.fields;
        const name = fields.Name.value;
        const description = fields.Description__c.value;
        const dueDate = fields.Due_Date__c.value;
        createTask({ name, description, dueDate, priority: this.priority })
            .then(result => {
                this.tasks = [...this.tasks, result];
                form.reset();
            })
            .catch(error => console.error(error));
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'mark_as_completed') {
            this.updateStatus(row.Id, 'Completed');
        } else if (actionName === 'mark_as_in_progress') {
            this.updateStatus(row.Id, 'In Progress');
        }
    }

    updateStatus(taskId, status) {
        updateTaskStatus({ taskId, status })
            .then(updatedTask => {
                this.tasks = this.tasks.map(task => 
                    task.Id === updatedTask.Id ? updatedTask : task
                );
            })
            .catch(error => console.error(error));
    }
}
