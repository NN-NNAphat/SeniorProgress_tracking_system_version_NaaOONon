
<template>
  <div>
    <h1>{{ userdata.user_role }}</h1> 
    <h1>{{ user.user_role }}</h1> 
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
      userdata: [],
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
          this.userdata = res.data[0];
        });
    },
  },
};
</script>

<style>
</style>