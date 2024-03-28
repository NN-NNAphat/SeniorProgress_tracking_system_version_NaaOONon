<template>
  <!-- Show screen detel -->
  <div class="screen-details">
    <v-row style="margin-bottom: 20px" align="center">
      <v-col cols="12" v-if="screenId">
        <!-- Card แสดงข้อมูล Screen -->
        <v-card class="mx-auto align-start" max-width="none" hover>
          <v-img
            v-if="screen_pic"
            :src="screen_pic"
            alt="Screen PIC"
            width="100%"
            max-height="200px"
            @click="showImageDialog = true"
          ></v-img>

          <v-card-item
            class="d-flex justify-space-between align-center"
            @click="showDetails = !showDetails"
          >
            <v-card-title>{{ screen_name }}</v-card-title>
            <v-icon
              class="custom-btn"
              @click.stop="openUserListDialog"
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

      <!-- แสดงรูปภาพ Dialog -->
      <v-dialog
        v-model="showImageDialog"
        max-width="600"
        max-height="800"
        fitscreen
        hide-overlay
      >
        <v-img
          :src="screen_pic"
          style="width: 100%; height: 100%; object-fit: contain"
          @click="closeImageDialog"
        ></v-img>
      </v-dialog>

      <!-- แสดง ข้อมูลผู้ใช้ในระบบ Dialog -->
      <v-dialog v-model="userDialog" max-width="500" @keydown.stop>
        <v-card>
          <v-card-title>ข้อมูลผู้ใช้ในระบบ</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="user in userList" :key="user.user_id">
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
        <v-text-field
          v-model="searchQuery"
          label="Search"
          clearable
        ></v-text-field>
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
      </div>
      <v-divider></v-divider>

      <!-- v-tabs for filtering tasks by status -->
      <v-tabs v-model="selectedStatus">
        <v-tab v-for="(status, index) in statusOptions" :key="index">{{
          status
        }}</v-tab>

        <v-tab-item v-for="(status, index) in statusOptions" :key="index">
          <v-row>
            <v-col
              v-for="(task, index) in filteredTasksByStatus(status)"
              :key="index"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card class="task-card" style="width: auto; height: 730px">
                <v-card-title>
                  <h3 style="margin-right: 10px">{{ task.task_name }}</h3>
                  <v-divider vertical></v-divider>
                  <v-spacer></v-spacer>
                  <h4 style="margin-left: 10px">ID: {{ task.task_id }}</h4>
                </v-card-title>
                <v-card-text>
                  <p>Task Detail: {{ task.task_detail }}</p>
                  <p>Status: {{ task.task_status }}</p>
                  <p>Manday: {{ task.task_manday || 0 }}</p>
                  <p>Progress: {{ task.task_progress || 0 }}</p>
                  <p>Plan Start: {{ task.task_plan_start.slice(0, 10) }}</p>
                  <p>Plan End: {{ task.task_plan_end.slice(0, 10) }}</p>
                  <p>
                    Actual Start:
                    {{
                      task.task_actual_start
                        ? formatDate(task.task_actual_start)
                        : "Not determined"
                    }}
                  </p>
                  <p>
                    Actual End:
                    {{
                      task.task_actual_end
                        ? formatDate(task.task_actual_end)
                        : "Not determined"
                    }}
                  </p>

                  <!-- Display User details -->
                  <v-card-text v-if="task.memberDetails" elevation="2" outlined>
                    <img
                      :src="task.memberDetails.user_pic"
                      alt="User Pic"
                      style="width: 100px; height: 100px"
                    />
                    <p>First Name: {{ task.memberDetails.user_firstname }}</p>
                    <p>Last Name: {{ task.memberDetails.user_lastname }}</p>
                    <p>Position: {{ task.memberDetails.user_position }}</p>
                  </v-card-text>

                  <!-- Display message if User details are not available -->
                  <v-card-text v-else elevation="2" outlined>
                    <p>User not determine</p>
                  </v-card-text>
                </v-card-text>

                <v-card-actions class="text-right">
                  <v-btn
                    color="primary"
                    @click="
                      dialogEditTaskForm = true;
                      editedTask = task;
                    "
                  >
                    Edit
                  </v-btn>
                  <v-btn color="primary" @click="deleteTask(task)">
                    Delete
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-tab-item>
      </v-tabs>

      <v-row justify="center">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          @input="paginate"
        ></v-pagination>
      </v-row>
    </div>

    <!-- Edit task dialog -->
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
              v-model="editedTask.task_detail"
              label="Detail"
              required
            ></v-text-field>
            <v-select
              v-model="editedTask.task_status"
              :items="[
                'start',
                'stop',
                'correct',
                'mistake',
                'Not started yet',
              ]"
              label="Status"
              required
              outlined
              dense
            ></v-select>

            <v-text-field
              v-model="editedTask.task_manday"
              label="Manday"
              required
            ></v-text-field>
            <v-row align="center">
              <v-col cols="3">
                <v-text-field
                  v-model="editedTask.task_progress"
                  label="Progress"
                  type="number"
                  min="0"
                  max="100"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="9">
                <v-slider
                  v-model="editedTask.task_progress"
                  :thumb-label="true"
                  thumb-size="20"
                  ticks="always"
                  tick-size="2"
                  tick-thickness="2"
                  track-color="primary"
                  :max="100"
                  :min="0"
                  step="1"
                ></v-slider>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-menu
                  v-model="planStartMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      :value="
                        formatDate(editedTask.task_plan_start)
                          ? formatDate(editedTask.task_plan_start)
                              .slice(0, 10)
                              .replace('T', ' ')
                          : null
                      "
                      label="Plan Start"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="editedTask.task_plan_start"
                    no-title
                    scrollable
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-menu
                  v-model="planEndMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      :value="
                        editedTask.task_plan_end
                          ? formatDate(editedTask.task_plan_end)
                              .slice(0, 10)
                              .replace('T', ' ')
                          : null
                      "
                      label="Plan End"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="editedTask.task_plan_end"
                    no-title
                    scrollable
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-menu
                  v-model="actualStartMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      :value="
                        editedTask.task_actual_start
                          ? formatDate(editedTask.task_actual_start)
                              .slice(0, 10)
                              .replace('T', ' ')
                          : null
                      "
                      label="Actual Start"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="editedTask.task_actual_start"
                    no-title
                    scrollable
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-menu
                  v-model="actualEndMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      :value="
                        editedTask.task_actual_end
                          ? formatDate(editedTask.task_actual_end)
                              .slice(0, 10)
                              .replace('T', ' ')
                          : null
                      "
                      label="Actual End"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="editedTask.task_actual_end"
                    no-title
                    scrollable
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
            <v-select
              v-model="editedTask.task_member_id"
              :items="userListCreate"
              item-value="user_id"
              item-text="user_name"
              label="Member ID"
              outlined
              dense
            ></v-select>

            <v-btn type="submit">Update</v-btn>
            <v-btn color="error" @click="cancelEdit">Cancel</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

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
              v-model="newTask.task_detail"
              label="Detail"
              required
            ></v-text-field>

            <v-select
              v-model="newTask.task_status"
              :items="statusOptions"
              label="Status"
              required
            ></v-select>

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
            <v-select
              v-model="newTask.task_member_id"
              :items="userListCreate"
              item-value="user_id"
              item-text="user_name"
              label="Member ID"
              required
            ></v-select>

            <v-text-field
              v-model="newTask.task_manday"
              label="Manday"
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
</template>

<script>
import Swal from "sweetalert2";

export default {
  layout: "admin",

  data() {
    return {
      selectedStatus: "start",
      planStartMenu: false,
      planEndMenu: false,
      actualStartMenu: false,
      actualEndMenu: false,
      editedTask: {
        task_name: "",
        task_detail: "",
        task_status: "",
        task_manday: "",
        task_progress: "",
        task_plan_start: "",
        task_plan_end: "",
        task_actual_start: "",
        task_actual_end: "",
        task_member_id: "",
      },
      tasks: [],
      currentPage: 1,
      pageSize: 12,
      statusOptions: ["start", "stop", "correct", "mistake", "Not started yet"],
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
      userListCreate: [],
      screenId: "",
      system_id: "",
      project_id: "",

      showDetails: false,
      // Dialogs
      dialogEditTaskForm: false,
      dialogAddTaskForm: false,
      show: false,
      searchQuery: "",
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
    filteredTasksByStatus() {
      return (status) => {
        if (this.tasks && Array.isArray(this.tasks)) {
          return this.tasks.filter(
            (task) => task.task_status.toLowerCase() === status.toLowerCase()
          );
        } else {
          return [];
        }
      };
    },
    paginatedTasks() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.tasks.slice(startIndex, endIndex);
    },
    // คำนวณจำนวนหน้าทั้งหมด
    totalPages() {
      return Math.ceil(this.tasks.length / this.pageSize);
    },
    filteredTasks() {
      if (this.tasks && Array.isArray(this.tasks)) {
        return this.tasks.filter((task) => {
          // ตรวจสอบว่า task.memberDetails มีค่าหรือไม่
          if (task.memberDetails) {
            // นำเนื้อหาของ v-card-text ที่เกี่ยวข้องกับ task.memberDetails มาต่อกันเพื่อค้นหา
            const textContent =
              `${task.memberDetails.user_firstname} ${task.memberDetails.user_lastname} ${task.memberDetails.user_position}`.toLowerCase();
            // ค้นหาโดยใช้ searchQuery ที่ผูกกับ input และคืนค่า true เมื่อพบข้อความที่ค้นหา
            return textContent.includes(this.searchQuery.toLowerCase());
          } else {
            return false;
          }
        });
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
    async deleteTask(task) {
      try {
        const response = await fetch(
          `http://localhost:7777/tasks/deleteHistoryTasks/${task.id}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          // ลบงานเรียบร้อย
          Swal.fire({
            icon: "success",
            title: "Task deleted successfully",
          });
          // รีเฟรชรายการงานหลังจากลบเสร็จ
          this.fetchTasks();
        } else {
          // แจ้งเตือนเมื่อเกิดข้อผิดพลาดในการลบงาน
          throw new Error("Failed to delete task");
        }
        this.fetchTasks();
        this.fetchScreenDetail();
      } catch (error) {
        console.error("Error deleting task:", error);
        Swal.fire({
          icon: "error",
          title: "Error deleting task",
          text: "Please try again",
        });
      }
    },
    async fetchMemberDetails(memberId) {
      try {
        const response = await fetch(
          `http://localhost:7777/users/getOne/${memberId}`
        );
        const data = await response.json();
        return data[0]; // สมมติว่า API จะส่งข้อมูลผู้ใช้กลับมาเป็นอาเรย์ โดยมีข้อมูลผู้ใช้เพียงรายการเดียว
      } catch (error) {
        console.error("Error fetching member details:", error);
        return null;
      }
    },

    formatDate(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    paginate(page) {
      this.currentPage = page;
    },
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
        this.userListCreate = userList.map((user) => ({
          user_id: user.id,
          user_name: `${user.user_firstname} ${user.user_lastname}`,
        }));
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
    toggleDetails(task) {
      task.showDetails = !task.showDetails; // เปลี่ยนสถานะ showDetails เมื่อปุ่มถูกคลิก
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

        // แก้ไขโค้ดเพิ่มเติมในการกำหนดค่า showDetails เข้าไปในข้อมูลของแต่ละ task
        this.tasks = await Promise.all(
          tasks.map(async (task) => {
            // เรียกใช้ fetchMemberDetails เพื่อดึงข้อมูลของสมาชิกที่เกี่ยวข้องกับแต่ละงาน
            const memberDetails = await this.fetchMemberDetails(
              task.task_member_id
            );
            // เพิ่มข้อมูลผู้ใช้ใน memberDetails ของแต่ละงาน
            return {
              ...task,
              showDetails: false,
              memberDetails: memberDetails, // เก็บข้อมูลผู้ใช้ใน memberDetails
            };
          })
        );
        this.fetchScreenDetail();
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
      try {
        const {
          task_id,
          task_name,
          task_detail,
          task_status,
          task_plan_start,
          task_plan_end,
          task_member_id,
          task_manday,
        } = this.newTask;

        const response = await fetch(
          `http://localhost:7777/tasks/createTasks`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              task_id,
              task_name,
              task_detail,
              task_status,
              screen_id: this.screenId, // ใช้ค่า screenId ที่มาจาก data()
              project_id: this.project_id, // ใช้ค่า project_id ที่มาจาก data()
              system_id: this.system_id, // ใช้ค่า system_id ที่มาจาก data()
              task_plan_start,
              task_plan_end,
              task_member_id,
              task_manday,
            }),
          }
        );

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Task created successfully",
          });
          this.dialogAddTaskForm = false;
          this.fetchTasks();
          this.fetchScreenDetail();
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

    // Update task
    async updateTask() {
      try {
        // Convert task date fields to the correct format
        this.editedTask.task_plan_start = this.formatDate(
          this.editedTask.task_plan_start
        );
        this.editedTask.task_plan_end = this.formatDate(
          this.editedTask.task_plan_end
        );
        this.editedTask.task_actual_start = this.formatDate(
          this.editedTask.task_actual_start
        );
        this.editedTask.task_actual_end = this.formatDate(
          this.editedTask.task_actual_end
        );

        const response = await fetch(
          `http://localhost:7777/tasks/updateTasks/${this.editedTask.id}`,
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
        this.fetchScreenDetail();
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
.not-available p {
  width: 100px;
  height: 100px;
}
</style>