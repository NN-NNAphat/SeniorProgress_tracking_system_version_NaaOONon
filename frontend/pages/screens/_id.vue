<template>
  <div class="screen-details">
    <v-row v-if="ScreenName" style="margin-bottom: 20px" align="center">
      <v-col cols="6">
        <ScreenDetailsCard
          :ScreenName="ScreenName"
          :screenProgress="screenProgress"
          :screenPlanStart="screenPlanStart"
          :screenPlanEnd="screenPlanEnd"
          :screenManday="screenManday"
          @toggleDetails="toggleDetails"
        />
      </v-col>

      <v-col>
        <v-btn class="custom-btn" @click="openUserListDialog">
          แสดงรายชื่อผู้ใช้ในระบบ
        </v-btn>

        <v-dialog v-model="userDialog" max-width="500">
          <v-card>
            <v-card-title>ข้อมูลผู้ใช้ในระบบ</v-card-title>
            <v-card-text>
              <div>Id: {{ id }}</div>
              <div>System Id: {{ system_id }}</div>
              <div>Project Id: {{ project_id }}</div>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="userDialog = false">ปิด</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
    <!-- Search bar -->
    <v-row no-gutters>
      <v-col cols="12">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          style="
            margin-bottom: 10px;
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
          "
        />
      </v-col>
    </v-row>
    <!-- Task list -->
    <div class="task-list">
      <!-- ScreenName and Progress -->
      <div class="topper">
        <h3>Task Management: {{ ScreenName }}</h3>
        <v-divider vertical></v-divider>
        <!-- open add task form -->
        <v-btn color="primary" @click="dialogAddTaskForm = true"
          >Add Task</v-btn
        >
        <!-- <h3>Progress: {{ ScreenProgress }}</h3> -->
      </div>
      <v-divider></v-divider>
      <!-- Display Task in Card -->
      <v-row>
        <v-col
          v-for="task in filteredTasks"
          :key="task.task_id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card class="task-card">
            <v-card-title>
              <h3 style="margin-right: 10px">{{ task.task_name }}</h3>
              <v-divider vertical></v-divider>
              <v-spacer></v-spacer>
              <h4 style="margin-left: 10px">ID: {{ task.task_id }}</h4>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-avatar color="grey" size="36">
                  <v-icon dark>mdi-account</v-icon>
                </v-avatar>
                <h4 style="margin-left: 20px; margin-top: 5px">
                  {{ task.person_in_charge }}
                </h4>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                @click="
                  dialogEditTaskForm = true;
                  editedTask = task;
                "
                >Edit</v-btn
              >
              <v-spacer></v-spacer>
              <v-btn icon @click="show = !show">
                <v-icon>{{
                  show ? "mdi-chevron-up" : "mdi-chevron-down"
                }}</v-icon>
              </v-btn>
            </v-card-actions>
            <v-expand-transition>
              <div v-show="show" style="margin-left: 10px; margin-right: 10px">
                <v-divider></v-divider>
                <v-row>
                  <v-col cols="6">
                    <v-card-text
                      >Plan Start: {{ task.task_plan_start }}</v-card-text
                    >
                  </v-col>
                  <v-col cols="6">
                    <v-card-text>End: {{ task.task_plan_end }}</v-card-text>
                  </v-col>
                </v-row>
                <v-card-text>Task Detail: {{ task.task_detail }}</v-card-text>
              </div>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>
      <!-- Edit task dialog -->
      <div>
        <v-dialog v-model="dialogEditTaskForm" max-width="600px">
          <v-card>
            <v-card-title>
              <h2>Edit Task</h2>
            </v-card-title>
            <v-card-text>
              <!-- Edit task form -->
              <v-form @submit.prevent="updateTask">
                <!-- Form fields to edit task details -->
                <v-text-field
                  v-model="editedTask.task_name"
                  label="Task Name"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="editedTask.person_in_charge"
                  label="Person in Charge"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="editedTask.task_plan_start"
                  label="Plan Start"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="editedTask.task_plan_end"
                  label="Plan End"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="editedTask.task_detail"
                  label="Detail"
                  required
                ></v-text-field>
                <!-- Submit button -->
                <v-btn type="submit">Update</v-btn>
                <!-- Cancel button -->
                <v-btn color="error" @click="cancelEdit">Cancel</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-dialog>
      </div>
      <!-- Create task dialog -->
      <v-dialog v-model="dialogAddTaskForm" max-width="600px">
        <v-card>
          <v-card-title>
            <h2>Create New Task</h2>
          </v-card-title>
          <v-card-text>
            <!-- Create task form -->
            <v-form @submit.prevent="createTask">
              <!-- Form fields to create a new task -->
              <v-text-field
                v-model="newTask.task_id"
                label="Task ID"
                required
              ></v-text-field>
              <v-text-field
                v-model="newTask.task_name"
                label="Task Name"
                required
              ></v-text-field>
              <v-text-field
                v-model="newTask.person_in_charge"
                label="Person in Charge"
                required
              ></v-text-field>
              <v-text-field
                v-model="newTask.task_plan_start"
                label="Plan Start"
                type="date"
                required
              ></v-text-field>
              <v-text-field
                v-model="newTask.task_plan_end"
                label="Plan End"
                type="date"
                required
              ></v-text-field>
              <v-text-field
                v-model="newTask.task_detail"
                label="Detail"
                required
              ></v-text-field>
              <!-- Submit button -->
              <v-btn type="submit">Create</v-btn>
              <!-- Cancel button -->
              <v-btn color="error" @click="cancel">Cancel</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script>
import ScreenDetailsCard from "../../components/Task/ScreenDetailsCard.vue";
import Swal from "sweetalert2";

export default {
  layout: "admin",
  components: {
    ScreenDetailsCard,
  },
  props: {
    ScreenName: String,
    screenProgress: Number,
    screenPlanStart: String,
    screenPlanEnd: String,
    screenManday: Number,
  },
  data() {
    return {
      userDialog: false,
      id: "", // เก็บค่า Id
      system_id: "", // เก็บค่า System Id
      project_id: "", // เก็บค่า Project Id

      showDetails: false,
      // Dialogs
      dialogEditTaskForm: false,
      dialogAddTaskForm: false,
      show: false,
      //ScreenProgress: "",
      //Search bar
      searchQuery: "",

      //Edited Task data
      searchQuery: "",
      editedTask: {
        task_id: "",
        task_name: "",
        person_in_charge: "No one in charge",
        task_status: "",
        task_plan_start: "",
        task_plan_end: "",
        task_detail: "",
      },
      //Task data
      tasks: [],
      //New Task data
      newTask: {
        task_id: "",
        task_name: "",
        person_in_charge: "",
        task_plan_start: "",
        task_plan_end: "",
        task_detail: "",
      },
    };
  },
  computed: {
    filteredTasks() {
      if (this.tasks && Array.isArray(this.tasks)) {
        return this.tasks.filter((task) =>
          task.task_name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      } else {
        return [];
      }
    },
  },
  async mounted() {
    this.fetchScreenDetail();
    this.fetchTasks();
  },
  methods: {
    toggleDetails() {
      this.$emit("toggleDetails");
    },
    //Fetch screen detail
   async fetchScreenDetail() { 
      try {
        const screenId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/screens/getOne/${screenId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch screen");
        }
        const screenData = await response.json();
        console.log("Screen data:", screenData); // Log the received data
        // Assuming screenData is an array with one element
        const screen = screenData[0];
        this.ScreenName = screen.screen_name; // Set the ScreenName
        this.screenPlanStart = screen.screen_plan_start; // Set the Plan Start
        this.screenPlanEnd = screen.screen_plan_end; // Set the Plan End
        this.screenProgress = screen.screen_progress; // Set the Screen Progress
        this.screenManday = screen.screen_manday; // Set the Screen Manday
        // You can set other properties here as well
      } catch (error) {
        console.error("Error fetching screen:", error);
        // Handle error fetching Screen
      }
    },

    //Cancel create task
    cancel() {
      this.dialogAddTaskForm = false;
    },
    //fetch task
    async fetchTasks() {
      try {
        const screenId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:7777/tasks/searchByScreenId/${screenId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const tasks = await response.json();
        console.log("Tasks:", tasks); // Log the received tasks
        this.tasks = tasks; // Set the tasks
      } catch (error) {
        console.error("Error fetching tasks:", error);
        // Handle error fetching tasks
      }
    },

    // Open add task form
    openAddTaskForm() {
      this.$router.push({
        name: "task-add",
        params: { id: this.$route.params.id },
      });
    },
    //Create new task
    async createTask() {
      // Fetch screen detail for screen_id, system_id, and project_id
      const screenId = this.$route.params.id;
      const screenResponse = await fetch(
        `http://localhost:7777/screens/getOne/${screenId}`
      );
      const screenData = await screenResponse.json();
      const screen = screenData[0];
      // Convert date to correct format
      let startDate = new Date(this.newTask.task_plan_start);
      let formattedStartDate = startDate.toISOString().split("T")[0];

      let endDate = new Date(this.newTask.task_plan_end);
      let formattedEndDate = endDate.toISOString().split("T")[0];

      const requestData = {
        task_name: this.newTask.task_name,
        task_id: this.newTask.task_id,
        person_in_charge: this.newTask.person_in_charge,
        task_detail: this.newTask.task_detail,
        task_plan_start: formattedStartDate,
        task_plan_end: formattedEndDate,
        screen_id: screenId,
        project_id: screen.project_id,
        system_id: screen.system_id,
      };

      // Create new task
      try {
        const response = await fetch(
          "http://localhost:7777/tasks/createTasks",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData), // Use requestData instead of this.newTask
          }
        );

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Task created successfully",
          });
          this.dialogAddTaskForm = false;
          this.fetchTasks();
        } else {
          throw new Error("Failed to create new task");
        }
      } catch (error) {
        console.error("Error creating new task:", error);
        Swal.fire({
          icon: "error",
          title: "Error creating new task",
          text: "Please try again",
        });
      }
    },
    //Update task
    async updateTask() {
      try {
        const response = await fetch(
          `http://localhost:7777/tasks/updateTask/${this.editedTask.task_id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.editedTask),
          }
        );

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Task updated successfully",
          });
          this.dialogEditTaskForm = false;
          this.fetchTasks();
        } else {
          throw new Error("Failed to update task");
        }
      } catch (error) {
        console.error("Error updating task:", error);
        Swal.fire({
          icon: "error",
          title: "Error updating task",
          text: "Please try again",
        });
      }
    },
    cancelEdit() {
      this.dialogEditTaskForm = false;
    },
  },
};
</script>

<style scoped>
.task-card {
  margin-bottom: 10px;
}
.topper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.custom-btn {
  width: 100%;
  height: 50%;
}
</style>