<template>
  <!-- Dashboard container -->
  <div
    class="dashboard"
    style="
      background-color: #ffffff;
      padding: 10px 70px;
      border-radius: 0;
      margin-right: 30px;
    "
  >
    <!-- Greeting and current date/time -->
    <v-row no-gutters class="mt-4">
      <v-col class="text-left" style="margin-right: 16px">
        <h1 class="text-01">{{ greeting }}</h1>
        <h1>
          {{ this.$auth.user.user_position }} :
          {{ this.$auth.user.user_firstname }}
        </h1>
        <p class="text-01">{{ currentDateTime }}</p>
      </v-col>
    </v-row>

    <!-- Search bar -->
    <v-row no-gutters justify-content="flex-end" align-items="flex-end">
      <v-col cols="12">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          style="
            margin-bottom: 10px;
            width: 70%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 16px;
          "
        />

        <v-btn
          color="primary"
          class="text-none mb-4"
          @click="goToCreateProject"
          style="margin-left: 50px; width: 10%; height: 70%"
        >
          Create Project
        </v-btn>
        <v-btn
          color="error"
          @click="goToHistoryProject"
          style="margin-left: 10px; width: 10%; height: 70%"
          class="text-none mb-4"
        >
          <v-icon>mdi-delete</v-icon> &nbsp;Bin
        </v-btn>
      </v-col>
    </v-row>

    <!-- Project data table -->
    <v-data-table
      :headers="headers"
      :items="filteredProjects"
      :sort-by="[{ key: 'project_id', order: 'desc' }]"
    >
      <template v-slot:item="{ item }">
        <tr @click="viewProjectDetails(item)">
          <td>{{ item.project_id }}</td>
          <td>{{ item.project_name_TH }}</td>
          <td>{{ item.project_name_ENG }}</td>
          <td>
            <v-progress-linear
              color="primary"
              height="20"
              :value="parseFloat(item.project_progress)"
              :style="{ width: '100%' }"
              striped
            >
              <strong :style="{ color: 'white' }"
                >{{ parseFloat(item.project_progress) }}%</strong
              ></v-progress-linear
            >
          </td>

          <td>{{ formatDate(item.project_plan_start) }}</td>
          <td>{{ formatDate(item.project_plan_end) }}</td>

          <td>
            <!-- Dropdown menu for other actions -->
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn v-bind="attrs" v-on="on" icon>
                  <v-icon size="20" px>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <!-- Edit action -->
                <v-list-item @click="manageUserProjects(item)">
                  <v-list-item-content>Assign</v-list-item-content>
                </v-list-item>
                <v-list-item @click="openEditDialog(item)">
                  <v-list-item-content>Edit</v-list-item-content>
                </v-list-item>
                <!-- Delete action -->
                <v-list-item @click="softDeleteProject(item)">
                  <v-list-item-content class="red--text"
                    >Delete</v-list-item-content
                  >
                </v-list-item>
              </v-list>
            </v-menu>
          </td>
        </tr>
      </template>
    </v-data-table>

    <!-- Create Project Dialog -->
    <v-dialog
      v-model="createProjectDialog"
      max-width="600"
      ref="createProjectDialog"
    >
      <v-card>
        <v-card-title>Create New Project</v-card-title>
        <v-card-text>
          <!-- Form to create new project -->
          <v-form @submit.prevent="createProject">
            <v-text-field
              v-model="newProject.project_id"
              label="Project ID"
              required
              :rules="[rules.required, rules.projectId]"
            ></v-text-field>
            <v-text-field
              v-model="newProject.project_name_TH"
              label="Project Name (TH)"
              required
              :rules="[rules.required]"
            ></v-text-field>
            <v-text-field
              v-model="newProject.project_name_ENG"
              label="Project Name (EN)"
              required
              :rules="[rules.required]"
            ></v-text-field>

            <!-- New fields for SA, DEV, IMP selection -->
            <v-select
              v-model="selectedSA"
              :items="formatTeamMembers(teamMembersSA)"
              label="Select System Analyst"
              multiple
            >
              <template v-slot:prepend-item>
                <v-list-item @click="selectAllSA">
                  <v-list-item-content>Select All</v-list-item-content>
                </v-list-item>
              </template>
            </v-select>

            <v-select
              v-model="selectedDEV"
              :items="formatTeamMembers(teamMembersDEV)"
              label="Select Developer"
              multiple
            >
              <template v-slot:prepend-item>
                <v-list-item @click="selectAllDEV">
                  <v-list-item-content>Select All</v-list-item-content>
                </v-list-item>
              </template>
            </v-select>

            <v-select
              v-model="selectedIMP"
              :items="formatTeamMembers(teamMembersIMP)"
              label="Select Implementer"
              multiple
            >
              <template v-slot:prepend-item>
                <v-list-item @click="selectAllIMP">
                  <v-list-item-content>Select All</v-list-item-content>
                </v-list-item>
              </template>
            </v-select>

            <!-- Button to submit -->
            <v-btn color="primary" type="submit">Create</v-btn>
            <v-btn color="error" @click="createProjectDialog = false"
              >Cancel</v-btn
            >
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Edit Project Dialog -->
    <v-dialog
      v-model="editProjectDialog"
      max-width="600"
      ref="editProjectDialog"
    >
      <v-card>
        <v-card-title>Edit Project</v-card-title>
        <v-card-text>
          <!-- Form to edit system -->
          <v-form @submit.prevent="updateProject">
            <v-text-field
              v-model="editProject.project_id"
              label="Project ID"
              readonly
              disabled
            ></v-text-field>
            <v-text-field
              v-model="editProject.project_name_TH"
              label="Project Name (TH)"
            ></v-text-field>
            <v-text-field
              v-model="editProject.project_name_ENG"
              label="Project Name (EN)"
            ></v-text-field>
            <!-- Add more fields as needed -->
            <!-- You can also add selection fields for system analyst and member -->
            <!-- Add buttons to submit and cancel -->
            <v-btn color="primary" type="submit">Update</v-btn>
            <v-btn color="error" @click="editProjectDialog = false"
              >Cancel</v-btn
            >
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Manage project users dialog -->
    <v-dialog v-model="dialogUserProjects" max-width="600px">
      <v-card>
        <v-card-title>User Projects</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="search"
            label="Search"
            dense
            hide-details
            solo
            flat
            outlined
            color="primary"
            hint="Search here"
          ></v-text-field>

          <v-list>
            <v-list-item v-for="item in displayedUserProjects" :key="item.id">
              <v-list-item-avatar>
                <v-img
                  :src="getBase64Image(item.user_pic)"
                  height="50"
                  contain
                ></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title
                  >{{ item.user_firstname }}
                  {{ item.user_lastname }}</v-list-item-title
                >
                <v-list-item-subtitle>{{
                  item.user_position
                }}</v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <v-btn color="error" icon @click="deleteUser(project_id, item)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            @input="updateDisplayedUserProjects"
          ></v-pagination>
        </v-card-text>
        <v-card-actions>
          <!-- Button to open nested dialog -->
          <v-btn color="primary" @click="openNestedDialog()">Assign User</v-btn>
          <v-btn color="error" @click="dialogUserProjects = false"
            >Cancel</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Nested Dialog for Assigning User -->
    <v-dialog v-model="dialogAssignUser" max-width="500px">
      <v-card>
        <v-card-title>Assign User</v-card-title>
        <v-card-text>
          <!-- New field for selecting users -->
          <v-select
            v-model="selectedSystemAnalysts"
            :items="systemAnalysts"
            label="Select System Analyst"
            item-text="displayText"
            item-value="id"
            multiple
          >
            <template v-slot:prepend-item>
              <v-list-item @click="selectAllSystemAnalysts">
                <v-list-item-content>Select All</v-list-item-content>
              </v-list-item>
            </template>
          </v-select>

          <v-select
            v-model="selectedDevelopers"
            :items="developers"
            label="Select Developer"
            item-text="displayText"
            item-value="id"
            multiple
          >
            <template v-slot:prepend-item>
              <v-list-item @click="selectAllDevelopers">
                <v-list-item-content>Select All</v-list-item-content>
              </v-list-item>
            </template>
          </v-select>

          <v-select
            v-model="selectedImplementers"
            :items="implementers"
            label="Select Implementer"
            item-text="displayText"
            item-value="id"
            multiple
          >
            <template v-slot:prepend-item>
              <v-list-item @click="selectAllImplementers">
                <v-list-item-content>Select All</v-list-item-content>
              </v-list-item>
            </template>
          </v-select>
        </v-card-text>
        <v-card-actions>
          <!-- Button to assign selected users -->
          <v-btn color="primary" @click="assignUserAF">Assign</v-btn>
          <v-btn color="error" @click="closeNestedDialog">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import axios from "axios";

export default {
  middleware: "auth",
  name: "ProjectManagement",
  layout: "admin",
  data() {
    return {
      selectedSystemAnalysts: [],
      selectedDevelopers: [],
      selectedImplementers: [],
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,

      rules: {
        required: (value) => !!value || "Please fill this field.",
        projectId: (value) =>
          /^[A-Za-z0-9]+$/.test(value) ||
          "Project ID can only contain letters and numbers.",
      },
      page: 0,
      currentPage: 1,
      itemsPerPage: 5,
      selectedUsersAF: [],
      project_id: null,
      displayText: "",
      dialogAssignUser: false,
      selectedUsers: [],
      availableUsers: [],
      search: "", // Add this line
      dialogUserProjects: false, // ตัวแปรสำหรับเปิด/ปิด Dialog
      search: "",
      userProjectsHeaders: [
        { text: "ID", value: "id" },
        { text: "First Name", value: "user_firstname" },
        { text: "Last Name", value: "user_lastname" },
        { text: "Position", value: "user_position" },
        { text: "Picture", value: "user_pic" }, // เพิ่มหัวข้อ Picture ลงใน userProjectsHeaders
      ],
      userProjects: [], // เก็บข้อมูลที่ได้รับจาก API ในตัวแปรนี้
      teamMembersSA: [],
      teamMembersDEV: [],
      teamMembersIMP: [],
      newProject: {
        project_id: "",
        project_name_TH: "",
        project_name_ENG: "",
      },
      // Define variables to store selected team members
      selectedSA: [],
      selectedDEV: [],
      selectedIMP: [],
      // Sample team members data
      teamMembers: ["SA1", "SA2", "DEV1", "DEV2", "IMP1", "IMP2"],
      detailsDialog: false,
      createProjectDialog: false,
      editProjectDialog: false,
      selectedProject: null,
      greeting: "",
      currentDateTime: "",
      editDialog: false,
      editedProject: { project_name_TH: "", project_name_ENG: "" },
      projects: [],
      searchQuery: "",
      editProject: {
        project_id: "",
        project_name_TH: "",
        project_name_ENG: "",
      },
      headers: [
        { text: "Project ID", value: "project_id" },
        { text: "Project Name", value: "project_name_ENG" },
        { text: "Thai Name ", value: "project_name_TH" },
        { text: "Progress (%)", value: "project_progress" },
        { text: "Planned Start", value: "project_plan_start" },
        { text: "Planned End", value: "project_plan_end" },
        { text: "Action", value: "actions", sortable: false },
      ],
      defaultProject: {
        project_name_TH: "",
        project_name_ENG: "",
      },
    };
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) {
        return "Not determined";
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Not determined";
      }
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      return date.toLocaleDateString("en-GB", options);
    },
    selectAllSystemAnalysts() {
      if (this.selectedSystemAnalysts.length === this.systemAnalysts.length) {
        this.selectedSystemAnalysts = [];
      } else {
        this.selectedSystemAnalysts = [...this.systemAnalysts];
      }
    },
    selectAllDevelopers() {
      if (this.selectedDevelopers.length === this.developers.length) {
        this.selectedDevelopers = [];
      } else {
        this.selectedDevelopers = [...this.developers];
      }
    },
    selectAllImplementers() {
      if (this.selectedImplementers.length === this.implementers.length) {
        this.selectedImplementers = [];
      } else {
        this.selectedImplementers = [...this.implementers];
      }
    },

    updateDisplayedUserProjects() {
      // อัปเดตหน้าที่แสดงข้อมูลผู้ใช้เมื่อเปลี่ยนหน้า
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.displayedUserProjects = this.filteredUserProjects.slice(
        startIndex,
        endIndex
      );
    },
    setPage(pageNumber) {
      this.currentPage = pageNumber;
    },
    async manageUserProjects(item) {
      try {
        const project_id = item.id; // ดึง id ของ project จาก item ที่รับเข้ามา
        // ตรวจสอบว่า project_id มีค่าที่ถูกต้องหรือไม่
        if (!project_id) {
          console.error(
            "Error fetching user projects: project_id is undefined"
          );
          return;
        }
        this.fetchAvailableUsers(project_id);

        const response = await fetch(
          `http://localhost:7777/user_projects/getUserProjectsByProjectId/${project_id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user projects");
        }
        const data = await response.json();
        // นำข้อมูลที่ได้รับมาเก็บไว้ในตัวแปรของคุณเพื่อนำไปแสดงใน <v-dialog>
        this.userProjects = data;
        // เปิด <v-dialog> เพื่อแสดงข้อมูลที่ได้รับมา
        this.dialogUserProjects = true;
      } catch (error) {
        console.error("Error fetching user projects:", error);
      }
    },

    async deleteUser(project_id, item) {
      try {
        if (!project_id) {
          await Swal.fire({
            icon: "warning",
            title: "Warning",
            text: "Project ID is undefined",
          });
          console.error("Error deleting user: project_id is undefined");
          return;
        }

        // แสดงกล่องข้อความยืนยันก่อนทำการลบผู้ใช้
        const confirmResult = await Swal.fire({
          icon: "warning",
          title: "Are you sure?",
          text: "Are you sure you want to delete this user?",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No",
        });

        if (confirmResult.isConfirmed) {
          // ทำการลบผู้ใช้เมื่อผู้ใช้ยืนยันการลบ
          const response = await axios.delete(
            `http://localhost:7777/user_projects/deleteUserProjectById/${project_id}/${item.user_id}`
          );

          if (response.status === 200) {
            // Handle success
            await Swal.fire({
              icon: "success",
              title: "Success",
              text: response.data.message,
            });
            console.log(response.data.message);
            // อัปเดตตารางผู้ใช้หลังจากลบผู้ใช้เสร็จสิ้น
            await this.manageUserProjects({ id: project_id }); // เรียกใช้ฟังก์ชัน manageUserProjects เพื่ออัพเดทตารางผู้ใช้
            await this.fetchAvailableUsers(project_id);
          } else {
            // Handle error
            await Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed to delete user",
            });
            console.error("Failed to delete user:", response.status);
          }
        }
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error deleting user",
        });
        console.error("Error deleting user:", error);
      }
    },

    fetchAvailableUsers(project_id) {
      axios
        .get(
          "http://localhost:7777/user_projects/getUsersNotInProject/" +
            project_id
        )
        .then((response) => {
          this.availableUsers = response.data.map((user) => ({
            id: user.id,
            user_firstname: user.user_firstname,
            user_lastname: user.user_lastname,
            user_position: user.user_position,
            displayText: `${user.user_position}: ${user.user_firstname} ${user.user_lastname}`,
          }));
          // หลังจากกำหนดค่า availableUsers ให้กำหนดค่า project_id ด้วย
          this.project_id = project_id;
        })
        .catch((error) => {
          console.error("Error fetching available users:", error);
        });
    },

    async assignUserAF() {
      // ตรวจสอบว่ามีผู้ใช้ที่ถูกเลือกหรือไม่
      if (
        this.selectedSystemAnalysts.length === 0 &&
        this.selectedDevelopers.length === 0 &&
        this.selectedImplementers.length === 0
      ) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "No users selected to assign.",
        });
        return;
      }

      // ดึง project_id จากภายนอก Dialog โดยเรียกใช้ฟังก์ชัน fetchAvailableUsers(project_id)
      const project_id = this.project_id;

      // ตรวจสอบว่า project_id มีค่าหรือไม่
      if (!project_id) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "No project_id available.",
        });
        return;
      }

      // ส่งข้อมูลผู้ใช้ที่ถูกเลือกไปยัง API
      const user_ids = [
        ...this.selectedSystemAnalysts.map((user) => user.id),
        ...this.selectedDevelopers.map((user) => user.id),
        ...this.selectedImplementers.map((user) => user.id),
      ];

      try {
        const response = await axios.post(
          "http://localhost:7777/user_projects/createUser_project",
          {
            project_id,
            user_ids,
          }
        );
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Users assigned successfully!",
        });
        console.log("Users assigned successfully:", response.data);
        // เมื่อกำหนดผู้ใช้เสร็จสิ้น ให้เรียก fetchAvailableUsers เพื่ออัพเดตตารางผู้ใช้
        await this.manageUserProjects({ id: project_id }); // เรียกใช้ฟังก์ชัน manageUserProjects เพื่ออัพเดทตารางผู้ใช้
        await this.fetchAvailableUsers(project_id);
        // ปิด Dialog หลังจากกำหนดผู้ใช้เสร็จสิ้น
        this.dialogAssignUser = false;

        // อัพเดทตารางผู้ใช้หลังจากกำหนดผู้ใช้เสร็จสิ้น
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error assigning users.",
        });
        console.error("Error assigning users:", error);
      }
    },

    closeNestedDialog() {
      this.dialogAssignUser = false;
    },
    openNestedDialog() {
      this.dialogAssignUser = true;
    },
    assignUser() {
      // ตรวจสอบว่ามีผู้ใช้ที่ถูกเลือกหรือไม่
      if (this.selectedUsers.length === 0) {
        console.error("No users selected to assign.");
        return;
      }

      // ส่งข้อมูลผู้ใช้ที่ถูกเลือกไปยัง API
      const project_id = this.selectedProject.id;
      const user_ids = this.selectedUsers.map((user) => user.id);
      axios
        .post("http://localhost:7777/user_projects/createUser_project", {
          project_id: project_id,
          user_ids: user_ids,
        })
        .then((response) => {
          console.log("Users assigned successfully:", response.data);
          // ปิด Dialog หลังจากกำหนดผู้ใช้เสร็จสิ้น
          this.dialogAssignUser = false;
        })
        .catch((error) => {
          console.error("Error assigning users:", error);
        });
    },

    getBase64Image(base64) {
      return base64;
    },

    async fetchTeamMembers() {
      try {
        const responseSA = await fetch(
          "http://localhost:7777/users/getUserByPosition?user_position=System Analyst"
        );
        const responseDEV = await fetch(
          "http://localhost:7777/users/getUserByPosition?user_position=Developer"
        );
        const responseIMP = await fetch(
          "http://localhost:7777/users/getUserByPosition?user_position=Implementer"
        );

        if (!responseSA.ok || !responseDEV.ok || !responseIMP.ok) {
          throw new Error("Failed to fetch team members");
        }

        // Fetch team members data
        const teamMembersSA = await responseSA.json();
        const teamMembersDEV = await responseDEV.json();
        const teamMembersIMP = await responseIMP.json();

        // Assign to data properties with user_id included
        this.teamMembersSA = teamMembersSA.map((user) => ({
          user_id: user.id,
          user_firstname: user.user_firstname,
          user_lastname: user.user_lastname, // Include user_lastname here
          user_position: user.user_position,
          user_role: user.user_role,
        }));
        this.teamMembersDEV = teamMembersDEV.map((user) => ({
          user_id: user.id,
          user_firstname: user.user_firstname,
          user_lastname: user.user_lastname, // Include user_lastname here
          user_position: user.user_position,
          user_role: user.user_role,
        }));
        this.teamMembersIMP = teamMembersIMP.map((user) => ({
          user_id: user.id,
          user_firstname: user.user_firstname,
          user_lastname: user.user_lastname, // Include user_lastname here
          user_position: user.user_position,
          user_role: user.user_role,
        }));
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    },

    selectAllSA() {
      if (this.selectedSA.length === this.teamMembersSA.length) {
        this.selectedSA = [];
      } else {
        this.selectedSA = [...this.teamMembersSA];
      }
    },
    selectAllDEV() {
      if (this.selectedDEV.length === this.teamMembersDEV.length) {
        this.selectedDEV = [];
      } else {
        this.selectedDEV = [...this.teamMembersDEV];
      }
    },
    selectAllIMP() {
      if (this.selectedIMP.length === this.teamMembersIMP.length) {
        this.selectedIMP = [];
      } else {
        this.selectedIMP = [...this.teamMembersIMP];
      }
    },

    formatTeamMembers(teamMembers) {
      return teamMembers.map((member) => ({
        text: `${member.user_position}: ${member.user_firstname} ${member.user_lastname}`,
        value: member,
      }));
    },
    async createProject() {
      if (
        !this.newProject.project_id ||
        !this.newProject.project_name_TH ||
        !this.newProject.project_name_ENG
      ) {
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Please fill in all required fields.",
        });
        return;
      }
      try {
        let requestBody = {
          project_id: this.newProject.project_id,
          project_name_TH: this.newProject.project_name_TH,
          project_name_ENG: this.newProject.project_name_ENG,
        };

        // Check if any team members are selected
        if (this.selectedSA.length > 0) {
          requestBody.selectedSA = this.selectedSA.map(
            (member) => member.user_id
          );
        }

        if (this.selectedDEV.length > 0) {
          requestBody.selectedDEV = this.selectedDEV.map(
            (member) => member.user_id
          );
        }

        if (this.selectedIMP.length > 0) {
          requestBody.selectedIMP = this.selectedIMP.map(
            (member) => member.user_id
          );
        }

        const response = await fetch(
          "http://localhost:7777/projects/createProject",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to create Project");
        }
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message || "New Project created successfully",
        });
        this.createProjectDialog = false;
        this.fetchProjects();
      } catch (error) {
        console.error("Error creating Project:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to create Project",
        });
      }
    },
    async fetchProjects() {
      try {
        const response = await fetch("http://localhost:7777/projects/getAll");
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        this.projects = data;
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    },
    async updateProject() {
      try {
        const response = await fetch(
          `http://localhost:7777/projects/updateProject/${this.editProject.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.editProject),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update project");
        }
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: "Project updated successfully",
        });
        this.editProjectDialog = false;
        this.fetchProjects();
      } catch (error) {
        console.error("Error updating project:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update project",
        });
      }
    },
    viewProjectDetails(project) {
      this.$router.push({
        path: `/Project/${project.id}`,
        params: { selectedProject: project },
      });
    },
    goToHistoryProject() {
      this.$router.push("/Project/HistoryProject");
    },
    openEditDialog(project) {
      this.editProject = { ...project };
      this.editProjectDialog = true;
    },
    async softDeleteProject(project) {
      try {
        const confirmResult = await Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        });

        if (confirmResult.isConfirmed) {
          const response = await fetch(
            `http://localhost:7777/projects/delete/${project.id}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete project");
          }

          console.log("Project deleted successfully");

          await Swal.fire(
            "Success",
            "Project deleted successfully.",
            "success"
          );

          this.fetchProjects();
        }
      } catch (error) {
        console.error("Error deleting project:", error);

        await Swal.fire(
          "Error",
          "An error occurred during the project deletion process.",
          "error"
        );
      }
    },
    async goToCreateProject() {
      this.createProjectDialog = true;
    },
    updateDateTime() {
      const now = new Date();
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      };

      this.greeting = this.getGreeting(now);
      this.currentDateTime = now.toLocaleDateString("en-US", options);
    },
    getGreeting(date) {
      const hour = date.getHours();

      if (hour >= 0 && hour < 12) {
        return "Good Morning";
      } else if (hour >= 12 && hour < 18) {
        return "Good Afternoon";
      } else {
        return "Good Evening";
      }
    },
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredUserProjects.length / this.itemsPerPage);
    },
    displayedUserProjects() {
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      return this.filteredUserProjects.slice(startIndex, endIndex);
    },
    developers() {
      // กรอง availableUsers เพื่อเลือกเฉพาะ user_position เป็น "Developer"
      return this.availableUsers.filter(
        (user) => user.user_position === "Developer"
      );
    },
    implementers() {
      // กรอง availableUsers เพื่อเลือกเฉพาะ user_position เป็น "Implementer"
      return this.availableUsers.filter(
        (user) => user.user_position === "Implementer"
      );
    },
    systemAnalysts() {
      // กรอง availableUsers เพื่อเลือกเฉพาะ user_position เป็น "System Analyst"
      return this.availableUsers.filter(
        (user) => user.user_position === "System Analyst"
      );
    },
    filteredUserProjects() {
      return this.userProjects.filter((item) => {
        return (
          item.id
            .toString()
            .toLowerCase()
            .includes(this.search.toLowerCase()) ||
          item.user_firstname
            .toLowerCase()
            .includes(this.search.toLowerCase()) ||
          item.user_lastname
            .toLowerCase()
            .includes(this.search.toLowerCase()) ||
          item.user_position.toLowerCase().includes(this.search.toLowerCase())
        );
      });
    },
    filteredProjects() {
      return this.projects
        .map((project) => ({
          ...project,
          project_progress: Math.round(project.project_progress || 0),
          project_plan_start: project.project_plan_start || "Not determined",
          project_plan_end: project.project_plan_end || "Not determined",
        }))
        .filter((project) => {
          const searchText = this.searchQuery.toLowerCase();
          return (
            (project.project_id &&
              project.project_id.toLowerCase().includes(searchText)) ||
            (project.project_name_ENG &&
              project.project_name_ENG.toLowerCase().includes(searchText)) ||
            (project.project_name_TH &&
              project.project_name_TH.toLowerCase().includes(searchText))
          );
        });
    },
  },

  mounted() {
    // ตรวจสอบว่ามี project_id ก่อนที่จะเรียกใช้ fetchAvailableUsers
    if (this.project_id) {
      this.fetchAvailableUsers(this.project_id);
    }
    this.fetchTeamMembers();
    this.updateDateTime();
    this.fetchProjects();
    setInterval(this.updateDateTime, 1000);
  },
};
</script>


<style scoped>
.text-01 {
  color: black !important;
}

.project-manager {
  color: #3f51b5;
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
}

.project-code {
  text-transform: uppercase;
  font-weight: bold;
  color: #6c757d;
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
}

.tracking-work-card {
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(255, 253, 253, 0.1);
  transition: transform 0.3s ease-in-out;
  background-color: #9747ff;
}

.tracking-work-card:hover {
  transform: translateY(-5px);
}

.tracking-work-card h2 {
  color: #ffffff;
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.work-item p {
  margin-bottom: 5px;
}

.work-item p:last-child {
  margin-bottom: 0;
}

.v-card-actions {
  padding: 10px;
  justify-content: space-between;
}

.project-button {
  color: #9747ff !important;
  background-color: #ffffff !important;
  font-weight: bold;
}

.project-title {
  display: flex;
  flex-direction: column;
}

.project-title h2 {
  margin-bottom: 5px;
  /* ปรับขนาดของระยะห่างระหว่างข้อมูล */
}

.router-link-underline {
  text-decoration: none;
  /* นำเส้นใต้ออก */
}

.router-link-underline:hover {
  text-decoration: underline;
  /* นำเส้นใต้กลับมาเมื่อเมาส์ไปวางทับ */
}
</style>