#include <stdio.h>
#include <malloc.h>
#include <stdint.h>
#include <stdbool.h>
#include "array_utils.h"

void push(void **array, void **value, uint32_t *size, uint32_t *capacity) {
  if (*size == *capacity) {
    *capacity = *capacity * 2;
    void *ptr = realloc(*array, *capacity);
  }

  array[*size] = *value;
  (*size)++;
}

static void swap(void **a, void **b) {
  void *t = *b;
  *b = *a;
  *a = t;
}

void splice(void **array, uint32_t index, uint32_t *size, bool shouldFreePointer) {
  if (index >= *size) {
    return;
  }

  uint32_t arrayIndex = *size;
  while (arrayIndex--) {
    if (arrayIndex <= index) {
      break;
    }

    if (array[index] == NULL) {
      continue;
    }

    for (uint32_t i = index; i < *size - 1; i++) {
      swap(&array[i], &array[i + 1]);
    }
    break;
  }
  (*size)--;

  if (array[*size] != NULL) {
    if (shouldFreePointer)  {
      free(array[*size]);
    }
    array[*size] = NULL;
  }
}
