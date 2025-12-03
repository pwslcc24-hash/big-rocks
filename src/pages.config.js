import Home from './pages/Home';
import AddTask from './pages/AddTask';
import TaskDetail from './pages/TaskDetail';
import EditTask from './pages/EditTask';
import CompletedTasks from './pages/CompletedTasks';


export const PAGES = {
    "Home": Home,
    "AddTask": AddTask,
    "TaskDetail": TaskDetail,
    "EditTask": EditTask,
    "CompletedTasks": CompletedTasks,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};