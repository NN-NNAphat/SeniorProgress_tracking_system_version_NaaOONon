<template>
  <div class="screen-details">
    <v-row style="margin-bottom: 20px" align="center">
      <v-col cols="12" v-if="screenId">
        <v-card class="mx-auto align-start" max-width="none" hover>
          <v-img
            v-if="screen_pic"
            :src="screen_pic"
            alt="Screen PIC"
            width="100%"
            max-height="450px"
            @click="showImageDialog = true"
          ></v-img>

          <v-card-item
            class="d-flex justify-space-between align-center"
            @click="showDetails = !showDetails"
          >
            <v-card-title>{{ screen_name }}</v-card-title>
            <v-icon
              class="custom-btn"
              @click="openUserListDialog"
              style="margin-right: 25px"
              >mdi-account-multiple</v-icon
            >
          </v-card-item>
          <v-card-subtitle>
            Screen Progress: {{ screen_progress }}
            <v-progress-linear
              color="deep-orange"
              height="10"
              :model-value="screen_progress"
              striped
            ></v-progress-linear>
          </v-card-subtitle>

          <v-expand-transition>
            <div v-show="showDetails">
              <v-divider></v-divider>
              <v-card-text>
                <p>Plan Start: {{ screen_plan_start }}</p>
                <p>Plan End: {{ screen_plan_end }}</p>
                <p>Screen Manday: {{ screen_manday }}</p>
                <p>Screen Level: {{ screen_level }}</p>
                <p>Screen Type: {{ screenType }}</p>
                <p>Task Count: {{ task_count }}</p>
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>

      <v-dialog
        v-model="showImageDialog"
        max-width="600"
        max-height="800"
        fullscreen
        hide-overlay
      >
        <v-img
          :src="screen_pic"
          style="width: 100%; height: 100%; object-fit: contain"
          @click="closeImageDialog"
        ></v-img>
      </v-dialog>

      <v-dialog v-model="userDialog" max-width="500">
        <v-card>
          <v-card-title>ข้อมูลผู้ใช้ในระบบ</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="user in userList" :key="user.id">
                <!-- แสดงรูปโปรไฟล์ของผู้ใช้ -->
                <v-list-item-avatar>
                  <v-img :src="user.user_pic" alt="User Profile"></v-img>
                </v-list-item-avatar>
                <!-- แสดงข้อมูลผู้ใช้ -->
                <v-list-item-content>
                  <v-list-item-title>
                    {{ user.user_firstname }} {{ user.user_lastname }}
                  </v-list-item-title>
                  <v-list-item-subtitle>{{
                    user.user_position
                  }}</v-list-item-subtitle>
                  <v-list-item-subtitle>{{
                    user.user_department
                  }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="closeUserListDialog">ปิด</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
        <h3>Task Management</h3>
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
import Swal from "sweetalert2";

export default {
  layout: "admin",

  data() {
    return {
      showImageDialog: false,
      screen_plan_start: "",
      screen_plan_end: "",
      screen_progress: "",
      screen_manday: "",
      screen_level: "",
      screen_pic: "",
      screenType: "",
      task_count: "",
      screen_name: "",
      userDialog: false,
      userList: [],
      screenId: "",
      system_id: "",
      project_id: "",

      showDetails: false,
      // Dialogs
      dialogEditTaskForm: false,
      dialogAddTaskForm: false,
      show: false,
      //ScreenProgress: "",
      //Search bar
      searchQuery: "", // ลบออกเนื่องจากซ้ำ
      //Edited Task data
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
    await this.fetchScreenDetail();
    await this.fetchUserList();
    this.fetchTasks();
  },
  methods: {
    closeImageDialog() {
      this.showImageDialog = false;
    },
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

        if (screenData.length === 0) {
          throw new Error("No screen data found");
        }

        const screen = screenData[0];
        this.screenId = screen.id; // Set the Screen Id
        this.system_id = screen.system_id; // Set the System Id
        this.project_id = screen.project_id; // Set the Project Id
        this.screen_name = screen.screen_name; // Set the ScreenName
        this.screen_level = screen.screen_level; // Set the Screen Level
        this.screen_manday = screen.screen_manday; // Set the Screen Manday
        this.screen_pic = await this.convertBase64ToURL(screen.screen_pic); // Convert Base64 to URL
        this.screen_progress = screen.screen_progress; // Set the Screen Progress
        this.task_count = screen.task_count; // Set the Task Count
        this.screen_plan_start = screen.screen_plan_start; // Set the Plan Start
        this.screen_plan_end = screen.screen_plan_end; // Set the Plan End
      } catch (error) {
        console.error("Error fetching screen:", error);
      }
    },

    async convertBase64ToURL(base64String) {
      try {
        const response = await fetch(`data:image/jpeg;base64,${base64String}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } catch (error) {
        console.error("Error converting Base64 to URL:", error);
        return ""; // Return empty string if conversion fails
      }
    },
    async fetchUserList() {
      try {
        await this.fetchScreenDetail();
        const { project_id, system_id, screenId } = this;

        const response = await fetch(
          `http://localhost:7777/user_screens/checkUsersINScreen/${project_id}/${system_id}/${screenId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user list");
        }
        const userList = await response.json();

        // Set the userList data
        this.userList = userList;
      } catch (error) {
        console.error("Error fetching user list:", error);
      }
    },
    openUserListDialog() {
      this.fetchUserList();
      this.userDialog = true;
    },

    closeUserListDialog() {
      this.userDialog = false; // ปิด Dialog
    },
    toggleDetails() {
      this.$emit("toggleDetails");
    },
    //Fetch screen detail

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
</style>