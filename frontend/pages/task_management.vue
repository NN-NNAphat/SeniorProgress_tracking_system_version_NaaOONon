
<template>
  <div>
    <h1>Hello task_management</h1>

    <h1>
      {{ user.user_role }} {{ user.user_firstname }} {{ user.user_position }}
    </h1>
  </div>
</template>

<script>
export default {
  middleware: "auth",
  layout: "admin",
  data() {
    return {
      user: this.$auth.user,
      loggedIn: this.$auth.loggedIn,
      screenId: "",
      screen: "",
    };
  },
  created() {
    this.getUser();
  },
  methods: {
    async getUser() {
      await this.$axios
        .get("/users/getOne/" + this.$auth.user.id)
        .then((res) => {
          this.id = res.data[0].id;
        });
    },
  },
};
</script>

<style>
</style>