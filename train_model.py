
import tensorflow as tf
import numpy as np
import os

# MNIST dataset load
(x_train, y_train), (x_test, y_test) = tf.keras.datasets.mnist.load_data()

# Normalize images
x_train = x_train.astype("float32") / 255.0
x_test = x_test.astype("float32") / 255.0

# Reshape images
x_train = x_train.reshape(-1, 28, 28, 1)
x_test = x_test.reshape(-1, 28, 28, 1)

# LeNet-5 Model
model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(28, 28, 1)),

    tf.keras.layers.Conv2D(6, kernel_size=5, activation="tanh", padding="same"),
    tf.keras.layers.AveragePooling2D(pool_size=2),

    tf.keras.layers.Conv2D(16, kernel_size=5, activation="tanh"),
    tf.keras.layers.AveragePooling2D(pool_size=2),

    tf.keras.layers.Flatten(),

    tf.keras.layers.Dense(120, activation="tanh"),
    tf.keras.layers.Dense(84, activation="tanh"),
    tf.keras.layers.Dense(10, activation="softmax")
])

# Compile model
model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

# Train model
model.fit(
    x_train,
    y_train,
    epochs=5,
    batch_size=128,
    validation_data=(x_test, y_test)
)

# Save trained model
os.makedirs("model", exist_ok=True)

model.save("model/lenet5_mnist.keras")

print("Model successfully trained and saved!")

# Evaluate model
loss, accuracy = model.evaluate(x_test, y_test)

print("Accuracy:", accuracy * 100, "%")
