<template>
  <transition name="modal-fade">
    <div class="modal-backdrop" @click="close">
      <div
        class="modal"
        role="dialog"
        aria-labelledby="modalTitle"
        aria-describedby="modalDescription"
        @click.stop=""
      >
        <font-awesome-icon @click="close" class="close" icon="times-circle" />
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  methods: {
    close() {
      this.$emit("close");
    }
  }
};
</script>

<style lang="scss">
.modal-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal {
  background: rgba(0, 0, 0, 0.8);
  padding: 10px 20px;
  border-radius: 10px;
  box-shadow: 2px 2px 20px 1px #000;
  display: flex;
  flex-direction: column;
  max-width: 60%;

  .night-reference &,
  .vote-history & {
    max-height: 80%;
    max-width: 80%;
    overflow-y: auto;
  }
  .characters & {
    background: rgba(0, 0, 0, 0.95);
    max-height: 100%;
    max-width: 100%;
    overflow-y: auto;
  }

  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    align-items: center;
    justify-content: center;
    line-height: 100%;
  }
  > .close {
    position: absolute;
    right: 20px;
    top: 20px;
    cursor: pointer;
    z-index: 5;
    &:hover {
      color: red;
    }
  }
}

.modal-fade-enter,
.modal-fade-leave-active {
  opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
</style>
