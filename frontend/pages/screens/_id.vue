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
            <div class="card-title">
              <v-card-title> Screen name : {{ screen_name }}</v-card-title>
            </div>
            <div class="icon">
              <v-icon
                class="custom-btn"
                @click.stop="openUserListDialog"
                style="margin-right: 25px"
                >mdi-account-multiple</v-icon
              >
            </div>
          </v-card-item>
          <v-card-subtitle @click="showDetails = !showDetails">
            <span style="font-weight: bold; color: black; font-size: 16px">
              Screen Progress: {{ Math.floor(screen_progress) }}%
            </span>
            <v-progress-linear
              color="primary"
              height="50"
              :value="parseFloat(screen_progress)"
              striped
            ></v-progress-linear>
          </v-card-subtitle>

          <v-expand-transition>
            <div v-show="showDetails">
              <v-divider></v-divider>
              <v-card-text>
                <p>
                  Plan Start:
                  {{
                    screen_plan_start
                      ? formatDate(screen_plan_start)
                      : "Not determined"
                  }}
                </p>
                <p>
                  Plan End:
                  {{
                    screen_plan_end
                      ? formatDate(screen_plan_end)
                      : "Not determined"
                  }}
                </p>

                <p>Screen Manday: {{ screen_manday }}</p>
                <p>Screen Level: {{ screen_level }}</p>

                <p>Task Count: {{ task_count }}</p>
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>

      <!-- แสดงรูปภาพ Dialog -->
      <v-dialog
        v-model="showImageDialog"
        max-width="1000"
        max-height="800"
        fitscreen
        hide-overlay
      >
        <v-img
          :src="screen_pic"
          class="dialog-image"
          @click="closeImageDialog"
        ></v-img>
      </v-dialog>

      <!-- แสดง ข้อมูลผู้ใช้ในระบบ Dialog -->
      <v-dialog v-model="userDialog" max-width="500" @keydown.stop>
        <v-card>
          <v-card-title>ข้อมูลผู้ใช้ในระบบ</v-card-title>
          <!-- เพิ่มช่องค้นหา User -->
          <v-card-actions>
            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field
                  v-model="searchUser"
                  label="Search"
                  clearable
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-actions>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="user in paginatedUserList"
                :key="user.user_id"
              >
                <v-list-item-avatar>
                  <v-img :src="user.user_pic" alt="User Profile"></v-img>
                </v-list-item-avatar>
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
          <v-card-actions
            class="pagination"
            style="display: flex; justify-content: space-between"
          >
            <v-pagination
              v-if="totalPagesUser > 1"
              v-model="currentPageUser"
              :length="totalPagesUser"
              @input="paginateUserList"
            ></v-pagination>
            <v-btn color="error" @click="closeUserListDialog">ปิด</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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

      <v-divider></v-divider>

      <!-- v-tabs for filtering tasks by status -->
      <v-tabs v-model="selectedStatus">
        <v-tab>All</v-tab>
        <v-tab v-for="(status, index) in statusOptions" :key="index">{{
          status
        }}</v-tab>
        <v-tab-item>
          <v-row>
            <!-- Dropdown for sorting -->
            <v-col cols="12" class="text-right">
              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn text v-bind="attrs" v-on="on" class="text-right">
                    sort by <v-icon>mdi-menu-down</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="sortTasks('task_name')"
                    >Sort by Task Name A-Z</v-list-item
                  >
                  <v-list-item @click="sortTasks('-task_name')"
                    >Sort by Task Name Z-A</v-list-item
                  >
                  <v-list-item @click="sortTasks('task_progress')"
                    >Sort by Progress (Low to High)</v-list-item
                  >
                  <v-list-item @click="sortTasks('-task_progress')"
                    >Sort by Progress (High to Low)</v-list-item
                  >
                  <v-list-item @click="sortTasks('task_plan_start')"
                    >Sort by Plan Start first date</v-list-item
                  >
                  <v-list-item @click="sortTasks('task_plan_start_last')"
                    >Sort by Plan Start last date</v-list-item
                  >
                  <v-list-item @click="sortTasks('task_plan_end')"
                    >Sort by Plan End first date</v-list-item
                  >
                  <v-list-item @click="sortTasks('task_plan_end_last')"
                    >Sort by Plan End last date</v-list-item
                  >
                  <!-- Add more sorting options as needed -->
                </v-list>
              </v-menu>
            </v-col>

            <v-col
              v-for="(task, index) in paginatedTasks"
              :key="index"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card
                class="mb-3"
                style="overflow-y: auto"
                @click="openDialog(task)"
              >
                <v-card-title
                  ><span style="margin-right: auto"
                    >ชื่องาน: {{ task.task_name }}</span
                  ></v-card-title
                >
                <v-card-text>
                  <!-- Row 1: Task Name and Progress -->
                  <div class="d-flex justify-space-between">
                    <v-row>
                      <v-col>
                        <span style="margin-right: auto; font-size: 17px"
                          >Progress :
                        </span>
                      </v-col>
                      <v-col>
                        <v-progress-linear
                          color="primary"
                          height="15"
                          :value="parseFloat(task.task_progress)"
                          striped
                          :style="{ width: '100%' }"
                        >
                          <strong :style="{ color: 'white' }"
                            >{{ parseFloat(task.task_progress) }}%</strong
                          ></v-progress-linear
                        >
                      </v-col>
                    </v-row>
                  </div>

                  <!-- Row 2: Task Detail -->
                  <p style="font-size: 16px; line-height: 1.5em; height: 170px">
                    Task Detail:
                    {{ task.task_detail ? task.task_detail : "Not determined" }}
                  </p>

                  <!-- Row 3: User Details -->
                  <div style="height: 100px">
                    <v-divider></v-divider>
                    <v-list v-if="task.memberDetails">
                      <v-list-item>
                        <v-list-item-avatar>
                          <img
                            :src="task.memberDetails.user_pic"
                            alt="User Pic"
                          />
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title
                            >First Name:
                            {{
                              task.memberDetails.user_firstname
                            }}</v-list-item-title
                          >
                          <v-list-item-subtitle
                            >Last Name:
                            {{
                              task.memberDetails.user_lastname
                            }}</v-list-item-subtitle
                          >
                          <v-list-item-subtitle
                            >Position:
                            {{
                              task.memberDetails.user_position
                            }}</v-list-item-subtitle
                          >
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                    <v-card-text v-else>
                      <div style="text-align: center; height: 70px">
                        <p>User not determined</p>
                      </div>
                    </v-card-text>
                    <v-divider></v-divider>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <!-- Row 4: Plan Start, Plan End, Buttons -->
                  <div style="display: flex; flex-direction: column">
                    <p>Status : {{ task.task_status }}</p>
                    <!-- Plan Start -->
                    <p>
                      Plan Start:
                      {{
                        task.task_plan_start
                          ? formatDate(task.task_plan_start)
                          : "Not determined"
                      }}
                    </p>

                    <!-- Plan End -->
                    <p>
                      Plan End:
                      {{
                        task.task_plan_end
                          ? formatDate(task.task_plan_end)
                          : "Not determined"
                      }}
                    </p>

                    <!-- Buttons -->
                    <div>
                      <v-btn
                        icon
                        color="primary"
                        @click.stop="
                          dialogEditTaskForm = true;
                          editedTask = task;
                        "
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon color="error" @click.stop="deleteTask(task)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>

          <!-- Pagination -->
          <v-pagination
            v-model="currentPage"
            :length="numberOfPages"
            @input="changePage"
          />
        </v-tab-item>

        <v-tab-item v-for="(status, index) in statusOptions" :key="index">
          <v-row>
            <v-col
              v-for="(task, index) in filteredTasksByStatus(status)"
              :key="index"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card
                class="mb-3"
                style="overflow-y: auto"
                @click="openDialog(task)"
              >
                <v-card-title
                  ><span style="margin-right: auto"
                    >ชื่องาน: {{ task.task_name }}</span
                  ></v-card-title
                >
                <v-card-text>
                  <!-- Row 1: Task Name and Progress -->
                  <div class="d-flex justify-space-between">
                    <v-row>
                      <v-col>
                        <span style="margin-right: auto; font-size: 17px"
                          >Progress : {{ task.task_progress || 0 }} %</span
                        >
                      </v-col>
                      <v-col>
                        <v-progress-linear
                          color="primary"
                          height="15"
                          :value="parseFloat(task.task_progress)"
                          striped
                          style="margin-left: auto"
                        ></v-progress-linear>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- Row 2: Task Detail -->
                  <p style="font-size: 16px; line-height: 1.5em; height: 170px">
                    Task Detail: {{ task.task_detail }}
                  </p>
                  <!-- Row 3: User Details -->
                  <div style="height: 100px">
                    <v-divider></v-divider>
                    <v-list v-if="task.memberDetails">
                      <v-list-item>
                        <v-list-item-avatar>
                          <img
                            :src="task.memberDetails.user_pic"
                            alt="User Pic"
                          />
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title
                            >First Name:
                            {{
                              task.memberDetails.user_firstname
                            }}</v-list-item-title
                          >
                          <v-list-item-subtitle
                            >Last Name:
                            {{
                              task.memberDetails.user_lastname
                            }}</v-list-item-subtitle
                          >
                          <v-list-item-subtitle
                            >Position:
                            {{
                              task.memberDetails.user_position
                            }}</v-list-item-subtitle
                          >
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                    <v-card-text v-else>
                      <div style="text-align: center; height: 70px">
                        <p>User not determined</p>
                      </div>
                    </v-card-text>
                    <v-divider></v-divider>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <!-- Row 4: Plan Start, Plan End, Buttons -->
                  <div style="display: flex; flex-direction: column">
                    <!-- Plan Start -->
                    <p>
                      Plan Start:
                      {{
                        task.task_plan_start
                          ? formatDate(task.task_plan_start)
                          : "Not determined"
                      }}
                    </p>

                    <!-- Plan End -->
                    <p>
                      Plan End:
                      {{
                        task.task_plan_end
                          ? formatDate(task.task_plan_end)
                          : "Not determined"
                      }}
                    </p>

                    <!-- Buttons -->
                    <div>
                      <v-btn
                        icon
                        color="primary"
                        @click.stop="
                          dialogEditTaskForm = true;
                          editedTask = task;
                        "
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon color="error" @click.stop="deleteTask(task)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-tab-item>

        <v-tab>Task to day</v-tab>
        <v-tab-item>
          <v-row>
            <v-col
              v-for="(task, index) in tasksToday"
              :key="index"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card
                class="mb-3"
                style="overflow-y: auto"
                @click="openDialog(task)"
              >
                <v-card-title
                  ><span style="margin-right: auto"
                    >ชื่องาน: {{ task.task_name }}</span
                  ></v-card-title
                >
                <v-card-text>
                  <!-- Row 1: Task Name and Progress -->
                  <div class="d-flex justify-space-between">
                    <v-row>
                      <v-col>
                        <span style="margin-right: auto; font-size: 17px"
                          >Progress : {{ task.task_progress || 0 }} %</span
                        >
                      </v-col>
                      <v-col>
                        <v-progress-linear
                          color="primary"
                          height="15"
                          :value="parseFloat(task.task_progress)"
                          striped
                          style="margin-left: auto"
                        ></v-progress-linear>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- Row 2: Task Detail -->
                  <p style="font-size: 16px; line-height: 1.5em; height: 170px">
                    Task Detail: {{ task.task_detail }}
                  </p>
                  <!-- Row 3: User Details -->
                  <div style="height: 100px">
                    <v-divider></v-divider>
                    <v-list v-if="task.memberDetails">
                      <v-list-item>
                        <v-list-item-avatar>
                          <img
                            :src="task.memberDetails.user_pic"
                            alt="User Pic"
                          />
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title
                            >First Name:
                            {{
                              task.memberDetails.user_firstname
                            }}</v-list-item-title
                          >
                          <v-list-item-subtitle
                            >Last Name:
                            {{
                              task.memberDetails.user_lastname
                            }}</v-list-item-subtitle
                          >
                          <v-list-item-subtitle
                            >Position:
                            {{
                              task.memberDetails.user_position
                            }}</v-list-item-subtitle
                          >
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                    <v-card-text v-else>
                      <div style="text-align: center; height: 70px">
                        <p>User not determined</p>
                      </div>
                    </v-card-text>
                    <v-divider></v-divider>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <!-- Row 4: Buttons, Plan Start, Plan End -->
                  <div
                    class="text-right"
                    style="padding: 10px; margin-right: auto"
                  >
                    <p>
                      Plan Start:
                      {{
                        task.task_plan_start
                          ? formatDate(task.task_plan_start)
                          : "Not determined"
                      }}
                    </p>
                    <p>
                      Plan End:
                      {{
                        task.task_plan_end
                          ? formatDate(task.task_plan_end)
                          : "Not determined"
                      }}
                    </p>
                    <v-btn
                      icon
                      color="primary"
                      @click.stop="
                        dialogEditTaskForm = true;
                        editedTask = task;
                      "
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon color="error" @click.stop="deleteTask(task)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-tab-item>
      </v-tabs>

      <!-- Dialog for Task Details -->
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title>Updates Task History </v-card-title>
          <v-card-text>
            <p>Task ID: {{ dialogTaskDetails.task_id }}</p>
            <p>Task Detail: {{ dialogTaskDetails.task_detail }}</p>
            <p>Status: {{ dialogTaskDetails.task_status }}</p>
            <p>Manday: {{ dialogTaskDetails.task_manday || 0 }}</p>
            <p>Progress: {{ dialogTaskDetails.task_progress || 0 }} %</p>
            <p>
              Plan Start:
              {{
                dialogTaskDetails.task_plan_start
                  ? formatDate(dialogTaskDetails.task_plan_start)
                  : "Not determined"
              }}
            </p>
            <p>
              Plan End:
              {{
                dialogTaskDetails.task_plan_end
                  ? formatDate(dialogTaskDetails.task_plan_end)
                  : "Not determined"
              }}
            </p>
            <p>
              Actual Start:
              {{
                dialogTaskDetails.task_actual_start
                  ? formatDate(dialogTaskDetails.task_actual_start)
                  : "Not determined"
              }}
            </p>
            <p>
              Actual End:
              {{
                dialogTaskDetails.task_actual_end
                  ? formatDate(dialogTaskDetails.task_actual_end)
                  : "Not determined"
              }}
            </p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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

            <!-- Plan -->
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
                        formatDate(editedTask.task_plan_start, 'DD-MM-YYYY')
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
                        formatDate(editedTask.task_plan_end, 'DD-MM-YYYY')
                      "
                      label="Plan End"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-on="on"
                      :disabled="!editedTask.task_plan_start"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="editedTask.task_plan_end"
                    no-title
                    scrollable
                    :min="editedTask.task_plan_start"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>

            <!-- Actual -->
            <v-row>
              <v-col cols="6">
                <v-menu
                  v-if="editedTask.task_plan_start && editedTask.task_plan_end"
                  v-model="actualStartMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      :value="
                        formatDate(editedTask.task_actual_start, 'DD-MM-YYYY')
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
                  v-if="editedTask.task_plan_start && editedTask.task_plan_end"
                  v-model="actualEndMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      :value="
                        formatDate(editedTask.task_actual_end, 'DD-MM-YYYY')
                      "
                      label="Actual End"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-on="on"
                      :disabled="!editedTask.task_actual_start"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="editedTask.task_actual_end"
                    no-title
                    scrollable
                    :min="editedTask.task_actual_start"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>

            <v-text-field
              v-model="editedTask.task_manday"
              label="Manday"
              required
            ></v-text-field>

            <!-- Member ID -->
            <v-select
              v-model="editedTask.task_member_id"
              :items="userListCreate"
              item-value="user_id"
              item-text="user_name"
              label="Member ID"
              required
            >
              <template v-slot:item="{ item }">
                <v-list-item-avatar>
                  <v-img :src="item.user_pic" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ item.user_name }}</v-list-item-title>
                </v-list-item-content>
              </template>
            </v-select>

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
          <v-form @submit.prevent="createTask(newTask)">
            <!-- Task ID -->
            <v-text-field
              v-model="newTask.task_id"
              label="Task ID"
              required
              :rules="[taskIDRules, onlyEnglishNumericSymbolRule]"
              append-icon="mdi-alert-circle"
              pattern="[A-Za-z0-9@#$%^&*()-_+=!]+"
            ></v-text-field>

            <!-- Task Name -->
            <v-text-field
              v-model="newTask.task_name"
              :rules="taskNameRules"
              label="Task Name"
              required
              append-icon="mdi-alert-circle"
            ></v-text-field>

            <!-- Detail -->
            <v-text-field
              v-model="newTask.task_detail"
              label="Detail"
              required
            ></v-text-field>

            <!-- Status -->
            <v-select
              v-model="newTask.task_status"
              :items="statusOptions"
              label="Status"
              required
            ></v-select>

            <!-- Plan Start -->
            <v-menu
              v-model="planStartMenu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              max-width="300px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  label="Plan Start"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-on="on"
                  required
                  @input="calculateManday"
                  :value="formatDate(newTask.task_plan_start)"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="newTask.task_plan_start"
                no-title
                scrollable
                max-width="300px"
                @input="calculateManday"
              ></v-date-picker>
            </v-menu>

            <!-- Plan End -->
            <v-menu
              v-model="planEndMenu"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              max-width="300px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  label="Plan End"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-on="on"
                  required
                  :min="newTask.task_plan_start"
                  @input="calculateManday"
                  :value="formatDate(newTask.task_plan_end)"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="newTask.task_plan_end"
                no-title
                scrollable
                max-width="300px"
                :min="newTask.task_plan_start"
                @input="calculateManday"
              ></v-date-picker>
            </v-menu>
            <v-text-field
              v-model="newTask.task_manday"
              label="Manday"
              required
              @change="calculateManday"
            ></v-text-field>

            <!-- Member ID -->
            <v-select
              v-model="newTask.task_member_id"
              :items="userListCreate"
              item-value="user_id"
              item-text="user_name"
              label="Member ID"
              required
            >
              <template v-slot:item="{ item }">
                <v-list-item-avatar>
                  <v-img :src="item.user_pic" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ item.user_name }}</v-list-item-title>
                </v-list-item-content>
              </template>
            </v-select>

            <!-- Submit button -->
            <v-btn
              color="primary"
              :disabled="!newTask.task_id || !newTask.task_name"
              type="submit"
              >Create</v-btn
            >

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
      dialog: false,
      dialogTaskDetails: {},
      currentPageUser: 1,
      itemsPerPage: 3,
      filteredUsers: [],
      searchUser: "",
      rules: {
        required: (value) => !!value || "Field is required",
        maxManday: (value) =>
          (value && value <= 10) || "Manday must not exceed 10",
      },
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
      perPage: 12,
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
        task_status: "Not started yet",
        person_in_charge: "",
        task_plan_start: null,
        task_plan_end: null,
        task_manday: 0,
        task_detail: "",
      },
      isEditableManday: true,
      taskIDRules: [
        (v) => !!v || "Task ID is required",
        (v) =>
          (v && /^[A-Za-z0-9@#$%^&*()-_+=!]+$/.test(v)) ||
          "Invalid characters. Only English letters, numbers, and symbols are allowed",
      ],
      taskNameRules: [
        (v) => !!v || "Task Name is required",
        (v) =>
          (v && v.length <= 50) ||
          "Task Name must be less than or equal to 50 characters",
      ],
    };
  },

  computed: {
    numberOfPages() {
      return Math.ceil(this.filteredTasks.length / this.perPage);
    },
    paginatedTasks() {
      const startIndex = (this.currentPage - 1) * this.perPage;
      const endIndex = startIndex + this.perPage;
      return this.filteredTasks.slice(startIndex, endIndex);
    },
    paginatedUserList() {
      const start = (this.currentPageUser - 1) * this.itemsPerPage;
      const end = this.currentPageUser * this.itemsPerPage;
      return this.filteredUsers.slice(start, end);
    },
    totalPagesUser() {
      return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    },
    filteredUserList() {
      return this.userList.filter(
        (user) =>
          user.user_firstname
            .toLowerCase()
            .includes(this.searchUser.toLowerCase()) ||
          user.user_lastname
            .toLowerCase()
            .includes(this.searchUser.toLowerCase()) ||
          user.user_position
            .toLowerCase()
            .includes(this.searchUser.toLowerCase()) ||
          user.user_department
            .toLowerCase()
            .includes(this.searchUser.toLowerCase())
      );
    },
    calculatedManday() {
      // Check if both task_plan_start and task_plan_end are selected
      if (this.newTask.task_plan_start && this.newTask.task_plan_end) {
        const start = new Date(this.newTask.task_plan_start);
        const end = new Date(this.newTask.task_plan_end);
        const differenceInTime = end.getTime() - start.getTime();
        const differenceInDays = differenceInTime / (1000 * 3600 * 24);
        return differenceInDays;
      } else {
        // If task_plan_end is not selected, return null
        return null;
      }
    },
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

    // คำนวณจำนวนหน้าทั้งหมด
    totalPages() {
      return Math.ceil(this.tasks.length / this.pageSize);
    },
    filteredTasks() {
      if (this.tasks && Array.isArray(this.tasks)) {
        return this.tasks.filter((task) => {
          // ตรวจสอบว่า task_name, task_id มีค่าหรือไม่
          if (task.task_name && task.task_id) {
            // นำเนื้อหาของ task_name, task_id มาต่อกันเพื่อค้นหา
            const searchText =
              `${task.task_name} ${task.task_id}`.toLowerCase();
            // ค้นหาโดยใช้ searchQuery ที่ผูกกับ input และคืนค่า true เมื่อพบข้อความที่ค้นหา
            return searchText.includes(this.searchQuery.toLowerCase());
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
  created() {
    // เรียกใช้ฟังก์ชันเมื่อโหลดหน้า
    this.getTasksToday();
  },
  watch: {
    filteredTasks: {
      handler() {
        // เรียกใช้ฟังก์ชันเมื่อมีการเปลี่ยนแปลงใน Task ของคุณ
        this.getTasksToday();
      },
      deep: true,
    },
    // Watcher to update task_manday when task_plan_start or task_plan_end changes
    newTask: {
      deep: true,
      handler(newVal) {
        this.calculateManday();
      },
    },
  },
  methods: {
    openDialog(task) {
      // กำหนดข้อมูล task ที่ต้องการแสดงใน dialog
      this.dialogTaskDetails = task;
      // เปิด dialog
      this.dialog = true;
    },
    sortTasks(criteria) {
      // Clone the tasks array to avoid mutating the original array
      let sortedTasks = [...this.tasks];

      // Sort the tasks based on the selected criteria
      switch (criteria) {
        case "task_name":
          sortedTasks.sort((a, b) => (a.task_name > b.task_name ? 1 : -1));
          break;
        case "-task_name":
          sortedTasks.sort((a, b) => (a.task_name < b.task_name ? 1 : -1));
          break;
        case "task_progress":
          sortedTasks.sort((a, b) => a.task_progress - b.task_progress);
          break;
        case "-task_progress":
          sortedTasks.sort((a, b) => b.task_progress - a.task_progress);
          break;
        case "task_plan_start":
          sortedTasks.sort(
            (a, b) => new Date(a.task_plan_start) - new Date(b.task_plan_start)
          );
          break;
        case "task_plan_start_last":
          sortedTasks.sort(
            (a, b) => new Date(b.task_plan_start) - new Date(a.task_plan_start)
          );
          break;
        case "task_plan_end":
          sortedTasks.sort(
            (a, b) => new Date(a.task_plan_end) - new Date(b.task_plan_end)
          );
          break;
        case "task_plan_end_last":
          sortedTasks.sort(
            (a, b) => new Date(b.task_plan_end) - new Date(a.task_plan_end)
          );
          break;
        default:
          // Do nothing if the criteria doesn't match any case
          break;
      }

      // Update the tasks with the sorted array
      this.tasks = sortedTasks;
    },

    changePage(page) {
      this.currentPage = page;
    },
    getTasksToday() {
      const currentDate = new Date(); // วันที่ปัจจุบัน
      currentDate.setHours(0, 0, 0, 0); // เซ็ตเวลาให้เป็นเที่ยงคืน
      this.tasksToday = this.filteredTasks.filter((task) => {
        const startDate = new Date(task.task_plan_start);
        const endDate = new Date(task.task_plan_end);
        startDate.setHours(0, 0, 0, 0); // เซ็ตเวลาให้เป็นเที่ยงคืน
        endDate.setHours(0, 0, 0, 0); // เซ็ตเวลาให้เป็นเที่ยงคืน
        // ตรวจสอบว่าเวลาของ Task อยู่ในช่วงเวลาปัจจุบันหรือไม่
        return (
          startDate.getTime() <= currentDate.getTime() &&
          endDate.getTime() >= currentDate.getTime()
        );
      });
    },

    paginateUserList(page) {
      this.currentPageUser = page;
    },
    closeUserListDialog() {
      this.userDialog = false;
    },
    onlyEnglishNumericSymbolRule(v) {
      return (
        (v && /^[A-Za-z0-9@#$%^&*()-_+=!]+$/.test(v)) ||
        "Invalid characters. Only English letters, numbers, and symbols are allowed"
      );
    },
    calculateManday() {
      // Check if both task_plan_start and task_plan_end are selected
      if (this.newTask.task_plan_start && this.newTask.task_plan_end) {
        const start = new Date(this.newTask.task_plan_start);
        const end = new Date(this.newTask.task_plan_end);

        // เพิ่มหนึ่งวันเพื่อครอบคลุมวันสิ้นสุดด้วย
        end.setDate(end.getDate() + 1);

        // หาความต่างระหว่างวันเริ่มและวันสิ้นสุดและคำนวณ Manday
        const oneDay = 24 * 60 * 60 * 1000; // หนึ่งวันในมิลลิวินาที
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / oneDay);
        this.newTask.task_manday = diffDays;
      } else {
        // If either task_plan_start or task_plan_end is not selected, set Manday to null
        this.newTask.task_manday = null;
      }
    },

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
      return `${day}/${month}/${year}`;
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
        this.filteredUsers = userList; // ตรวจสอบว่า filteredUsers ถูกตั้งค่าให้เป็น userList หรือไม่
        this.userListCreate = userList.map((user) => ({
          user_id: user.id,
          user_name: `${user.user_position} : ${user.user_firstname} ${user.user_lastname}`,
          user_pic: user.user_pic,
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
        } = this.newTask; // ตรวจสอบว่า task_plan_start, task_plan_end, และ task_manday ไม่ว่างเปล่าหรือไม

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
              screen_id: this.screenId,
              project_id: this.project_id,
              system_id: this.system_id,
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
    formatDisplayDate(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${day}/${month}/${year}`;
    },
    // Update task
    async updateTask() {
      try {
        // Convert task dates to the correct format before sending to the server
        const taskData = { ...this.editedTask }; // Clone the editedTask object
        taskData.task_plan_start = this.formatAPIDate(
          this.editedTask.task_plan_start
        );
        taskData.task_plan_end = this.formatAPIDate(
          this.editedTask.task_plan_end
        );
        taskData.task_actual_start = this.formatAPIDate(
          this.editedTask.task_actual_start
        );
        taskData.task_actual_end = this.formatAPIDate(
          this.editedTask.task_actual_end
        );

        const response = await fetch(
          `http://localhost:7777/tasks/updateTasks/${taskData.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData),
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

    formatAPIDate(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
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
.dialog-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border: 3px solid #0000002d;
}

.custom-expansion-panels {
  border: 1px solid #ccc; /* ใส่ขอบ */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* เพิ่มเงา */
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}
.text-right {
  text-align: right;
}
</style>