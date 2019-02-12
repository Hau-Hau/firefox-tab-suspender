#include <stdio.h>
#include <malloc.h>
#include <stdint.h>
#include <stdbool.h>
#include "array_utils.h"

#define INITIAL_SIZE 32

static void **array;
static uint32_t size = 0;
static uint32_t capacity = INITIAL_SIZE / 2;

uint32_t getSize() {
    return size;
}

uint32_t getCapacity() {
    return capacity;
}

//TODO check correction of &(array) (should be same as struct Window *)
void initialize(void **value) {
    array = value;
    array = malloc(windowsCapacity * sizeof(&(array)))
}

void **getObject() {
    return array;
}

void push(void **value) {
    ArrayUtils.push(array, value, &size, &capacity);
}

void splice(uint32_t index, bool shouldFreePointer) {
    ArrayUtils.splice(array, index, &size, shouldFreePointer);
}
