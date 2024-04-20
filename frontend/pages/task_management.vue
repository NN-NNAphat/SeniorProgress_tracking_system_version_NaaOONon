<template>
  <div>
    <div>
      <v-header> Project ของ ฉัน </v-header>
      <v-data-table :headers="headers" :items="projects">
        <template v-slot:item="{ item }">
          <tr>
            <td>{{ item.project_id }}</td>
            <td>{{ item.project_name_ENG }}</td>
            <!-- Add more columns here according to your data structure -->
          </tr>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script>
export default {
  middleware: "auth",
  layout: "admin",
  data() {
    return {
      projects: [],
      headers: [
        { text: "Project ID", value: "id" },
        { text: "Project Name", value: "name" },
        // Add more headers according to your data structure
      ],
    };
  },
  created() {
    this.getUserProjects();
  },
  methods: {
    async getUserProjects() {
      try {
        const userId = this.$auth.user.id;
        const response = await this.$axios.get(
          `user_projects/getProjectByUser_id/${userId}`
        );
        this.projects = [response.data]; // Assuming API returns a single project
      } catch (error) {
        console.error("Error fetching user projects:", error);
      }
    },
  },
};
</script>

<style>
/* Add your styles here */
</style>
