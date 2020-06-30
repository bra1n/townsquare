<template>
  <Modal
    class="editions"
    v-show="modals.edition"
    @close="toggleModal('edition')"
  >
    <div v-if="!isCustom">
      <h3>Select an edition:</h3>
      <ul class="editions">
        <li
          v-for="edition in editions"
          class="edition"
          v-bind:class="['edition-' + edition.id]"
          v-bind:key="edition.id"
          @click="setEdition(edition.id)"
        >
          {{ edition.name }}
        </li>
        <li class="edition edition-custom" @click="isCustom = true">
          Custom Script / Characters
        </li>
      </ul>
    </div>
    <div class="custom" v-else>
      <h3>Load custom script / characters</h3>
      To play with a custom script, you need to select the characters you want
      to play with in the official
      <a href="https://bloodontheclocktower.com/script-tool/" target="_blank"
        >Script Tool</a
      >
      and then upload the generated "custom-list.json" either directly here or
      provide a URL to such a hosted JSON file.<br />
      <br />
      To play with custom characters, please read
      <a
        href="https://github.com/bra1n/townsquare#custom-characters"
        target="_blank"
        >the documentation</a
      >
      on how to write a custom character definition file.
      <h3>Some popular custom scripts:</h3>
      <ul class="scripts">
        <li
          v-for="(script, index) in scripts"
          v-bind:key="index"
          @click="handleURL(script[1])"
        >
          {{ script[0] }}
        </li>
      </ul>
      <input
        type="file"
        ref="upload"
        accept="application/json"
        @change="handleUpload"
      />
      <div class="button-group">
        <div class="button" @click="openUpload">
          <font-awesome-icon icon="file-upload" /> Upload JSON
        </div>
        <div class="button" @click="promptURL">
          <font-awesome-icon icon="link" /> Enter URL
        </div>
        <div class="button" @click="isCustom = false">
          <font-awesome-icon icon="undo" /> Back
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import editionJSON from "../../editions";
import { mapMutations, mapState } from "vuex";
import Modal from "./Modal";

export default {
  components: {
    Modal
  },
  data: function() {
    return {
      editions: editionJSON,
      isCustom: false,
      scripts: [
        [
          "Catfishing 8.0 (+Sentinel)",
          "https://gist.githubusercontent.com/bra1n/8a5ec41a7bbf945f6b7dfc1cef72b569/raw/b5c63ac303f279dba918b897211cb6dc708bc64e/catfishing.json"
        ],
        [
          "On Thin Ice (Teensyville, +Sentinel)",
          "https://gist.githubusercontent.com/bra1n/8dacd9f2abc6f428331ea1213ab153f5/raw/9758aff4b59965dc7a094db549d950be5a26b571/custom-script.json"
        ],
        [
          "Race To The Bottom (Teensyville, +Sentinel, +Doomsayer)",
          "https://gist.githubusercontent.com/bra1n/63e1354cb3dc9d4032bcd0623dc48888/raw/5be4df8386ec61e3a98c32be77f8cac3f8414379/custom-script.json"
        ],
        [
          "Frankenstein's Mayor by Ted (Teensyville, +Sentinel)",
          "https://gist.githubusercontent.com/bra1n/32c52b422cc01b934a4291eeb81dbcee/raw/3ca5a043c41141ac40667dc15097deb327263268/Frankensteins_Mayor_by_Ted.json"
        ],
        [
          "Vigormortis High School (Teensyville, +Sentinel)",
          "https://gist.githubusercontent.com/bra1n/1f65bd4a999524719d5dabe98c3c2d27/raw/f28d3268846c182b2078888122003c6f95c6b2cf/VigormortisHighSchool.json"
        ]
      ]
    };
  },
  computed: mapState(["modals"]),
  methods: {
    openUpload() {
      this.$refs.upload.click();
    },
    handleUpload() {
      const file = this.$refs.upload.files[0];
      if (file && file.size) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          this.parseRoles(JSON.parse(reader.result));
        });
        reader.readAsText(file);
      }
    },
    promptURL() {
      const url = prompt("Enter URL to a custom-script.json file");
      if (url) {
        this.handleURL(url);
      }
    },
    async handleURL(url) {
      const res = await fetch(url);
      if (res && res.json) {
        const script = await res.json();
        this.parseRoles(script);
      }
    },
    parseRoles(roles) {
      if (!roles || !roles.length) return;
      this.$store.commit(
        "setCustomRoles",
        roles.map(role => {
          role.id = role.id.toLocaleLowerCase().replace(/[^a-z0-9-]/g, "");
          return role;
        })
      );
      this.$store.commit("setEdition", "custom");
      this.isCustom = false;
    },
    ...mapMutations(["toggleModal", "setEdition"])
  }
};
</script>

<style scoped lang="scss">
@import "../../vars";

// Editions
@each $img, $skipIcons in $editions {
  .edition-#{$img} {
    background-image: url("../../assets/editions/#{$img}.png");
  }
  @if $skipIcons != true {
    .edition-#{$img}.townsfolk {
      background-image: url("../../assets/editions/#{$img}-townsfolk.png");
    }
    .edition-#{$img}.outsider {
      background-image: url("../../assets/editions/#{$img}-outsider.png");
    }
    .edition-#{$img}.minion {
      background-image: url("../../assets/editions/#{$img}-minion.png");
    }
    .edition-#{$img}.demon {
      background-image: url("../../assets/editions/#{$img}-demon.png");
    }
  }
}

ul.editions .edition {
  font-family: PiratesBay, sans-serif;
  letter-spacing: 1px;
  text-align: center;
  padding-top: 15%;
  background-position: center center;
  background-size: 100% auto;
  background-repeat: no-repeat;
  width: 30%;
  margin: 5px;
  font-size: 120%;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
    1px 1px 0 #000, 0 0 5px rgba(0, 0, 0, 0.75);
  cursor: pointer;
  &:hover {
    color: red;
  }
}

.custom {
  text-align: center;
  input[type="file"] {
    display: none;
  }
  .scripts {
    list-style-type: disc;
    font-size: 120%;
    cursor: pointer;
    display: block;
    width: 50%;
    text-align: left;
    margin: 10px auto;
    li:hover {
      color: red;
    }
  }
}
</style>
