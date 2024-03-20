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
        <h1 class="text-01">{{ greeting }}, Bee</h1>
        <p class="text-01">{{ currentDateTime }}</p>
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

    <!-- Project data table -->
    <v-data-table
      :headers="headers"
      :items="filteredProjects"
      :sort-by="[{ key: 'project_id', order: 'asc' }]"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Project Management</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-btn color="primary" dark @click="goToCreateProject"
            >New Project</v-btn
          >
          <v-btn
            color="primary"
            dark
            @click="goToHistoryProject"
            style="margin-left: 10px"
            >Show History Project</v-btn
          >
        </v-toolbar>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon class="me-2" size="20" px @click="openEditDialog(item)">
          mdi-pencil-circle
        </v-icon>
        <v-icon size="20" px @click="softDeleteProject(item)">
          mdi-delete-empty
        </v-icon>
        <v-btn size="30" px @click="viewProjectDetails(item)">
          ProjectDetails
        </v-btn>
        <v-btn size="30" px @click="manageUserProjects(item)">
          manageUserProjects
        </v-btn>
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
            ></v-text-field>
            <v-text-field
              v-model="newProject.project_name_TH"
              label="Project Name (TH)"
            ></v-text-field>
            <v-text-field
              v-model="newProject.project_name_ENG"
              label="Project Name (EN)"
            ></v-text-field>

            <!-- New fields for SA, DEV, IMP selection -->
            <v-select
              v-model="selectedSA"
              :items="formatTeamMembers(teamMembersSA)"
              label="Select SA"
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
              label="Select DEV"
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
              label="Select IMP"
              multiple
            >
              <template v-slot:prepend-item>
                <v-list-item @click="selectAllIMP">
                  <v-list-item-content>Select All</v-list-item-content>
                </v-list-item>
              </template>
            </v-select>

            <!-- Button to submit -->
            <v-btn type="submit">Create</v-btn>
            <v-btn @click="createProjectDialog = false">Cancel</v-btn>
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
            <v-btn type="submit">Update</v-btn>
            <v-btn @click="editProjectDialog = false">Cancel</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Manage project users dialog -->
    <v-dialog v-model="dialogUserProjects" max-width="800px">
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
          ></v-text-field>
          <v-data-table
            :headers="userProjectsHeaders"
            :items="filteredUserProjects"
          >
            <template v-slot:item="{ item }">
              <tr>
                <td>{{ item.id }}</td>
                <td>{{ item.user_firstname }}</td>
                <td>{{ item.user_lastname }}</td>
                <td>{{ item.user_position }}</td>
                <td>
                  <v-img
                    :src="getBase64Image(item.user_pic)"
                    height="50"
                    contain
                  ></v-img>
                </td>
                <td>
                  <!-- Add trash icon here -->
                  <v-icon @click="deleteUser(project_id, item)"
                    >mdi-delete</v-icon
                  >
                </td>
              </tr>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="dialogUserProjects = false"
            >Close</v-btn
          >
          <!-- Button to open nested dialog -->
          <v-btn color="blue darken-1" text @click="openNestedDialog()"
            >Assign User</v-btn
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
            v-model="selectedUsersAF"
            :items="systemAnalysts"
            label="Select SA"
            item-text="displayText"
            item-value="id"
            multiple
          ></v-select>

          <v-select
            v-model="selectedUsersAF"
            :items="developers"
            label="Select DEV"
            item-text="displayText"
            item-value="id"
            multiple
          ></v-select>

          <v-select
            v-model="selectedUsersAF"
            :items="implementers"
            label="Select IMP"
            item-text="displayText"
            item-value="id"
            multiple
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="closeNestedDialog"
            >Cancel</v-btn
          >
          <!-- Button to assign selected users -->
          <v-btn color="blue darken-1" text @click="assignUserAF">Assign</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import axios from "axios";

export default {
  name: "ProjectManagement",
  layout: "admin",
  data() {
    return {
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
        { text: "Project Code", value: "project_id" },
        { text: "Project Name (ENG)", value: "project_name_ENG" },
        { text: "Project Name (TH)", value: "project_name_TH" },
        { text: "Progress (%)", value: "project_progress" },
        { text: "Planned Start", value: "project_plan_start" },
        { text: "Planned End", value: "project_plan_end" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      defaultProject: {
        project_name_TH: "",
        project_name_ENG: "",
      },
    };
  },
  methods: {
    
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
        // const projectId = project_id; // ไม่จำเป็นต้องทำเช่นนี้
        if (!project_id) {
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: "Project ID is undefined",
          });
          console.error("Error deleting user: project_id is undefined");
          return;
        }

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
          this.fetchAvailableUsers(project_id);
        } else {
          // Handle error
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete user",
          });
          console.error("Failed to delete user:", response.status);
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
      if (this.selectedUsersAF.length === 0) {
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
      const user_ids = this.selectedUsersAF;

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
        this.fetchAvailableUsers(project_id);
        // ปิด Dialog หลังจากกำหนดผู้ใช้เสร็จสิ้น
        this.dialogAssignUser = false;
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
          project_progress: project.project_progress || 0,
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