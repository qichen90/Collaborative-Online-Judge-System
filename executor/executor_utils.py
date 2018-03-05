import docker
import os, sys
import shutil
import uuid

from docker.errors import APIError
from docker.errors import ContainerError
from docker.errors import ImageNotFound

# get current directory
CURRENT_DIR = os.path.dirname(os.path.realpath(__file__))
IMAGE_NAME = 'qichen90/cs503_1801'

client = docker.from_env()

#store the code in tmp folder
TEMP_BUILD_DIR = "%s/tmp" % CURRENT_DIR
CONTAINER_NAME = "%s:latest" % IMAGE_NAME

SOURCE_FILE_NAMES = {
    "java": "Solution.java",
    "python": "solution.py",
    "c++": "solution.cpp"
}

BINARY_NAMES = {
    "java": "Solution",
    "python": "solution.py",
    "c++": "./a.out"
}

BUILD_COMMANDS = {
    "java": "javac",
    "python": "python3",
    "c++": "g++"
}

EXECUTE_COMMANDS = {
    "java": "java",
    "python": "python3",
    "c++": ""
}

# load docker image
def load_image():
    try:
        client.images.get(IMAGE_NAME)
        print("Docker image exists locally...")
    except ImageNotFound:
        # load from hub
        print("Loading image from docker hub....")
        client.image.pull(IMAGE_NAME)
    except APIError:
        # fail to connect to docker
        print("Cannot connect to docker")
        return 

def make_dir(dir):
    try:
        os.makedirs(dir)
    except OSError:
        print("cannot create directory")

def build_and_run(code, lang):
    result = {'build': None, 'run': None, 'error': None}
    # use the uuid to create unique file name
    source_file_parent_dir_name = uuid.uuid4()
    source_file_host_dir = "%s/%s" % (TEMP_BUILD_DIR, source_file_parent_dir_name)
    source_file_guest_dir = "/test/%s" % (source_file_parent_dir_name)
    make_dir(source_file_host_dir)

    # write code into source file
    with open("%s/%s" % (source_file_host_dir, SOURCE_FILE_NAMES[lang]), 'w') as source_file:
        source_file.write(code)
    
    # build code
    try:
        client.containers.run(
            image=IMAGE_NAME,
            command="%s %s" % (BUILD_COMMANDS[lang], SOURCE_FILE_NAMES[lang]),
            volumes={source_file_host_dir:{'bind': source_file_guest_dir, 'mode': 'rw'}},
            working_dir=source_file_guest_dir
        )
        print("source built")
        result['build'] = 'OK'
    except ContainerError as e:
        print("error")
        result['build'] = str(e.stderr, 'utf-8')
        # remove host dir
        shutil.rmtree(source_file_host_dir)
        return result
    
    # run code
    try:
        log = client.containers.run(
            image=IMAGE_NAME,
            command="%s %s" % (EXECUTE_COMMANDS[lang], BINARY_NAMES[lang]),
            volumes={source_file_host_dir:{'bind': source_file_guest_dir, 'mode': 'rw'}},
            working_dir=source_file_guest_dir
        )

        log = str(log, 'utf-8')
        result['run'] = log
        print("code run")
    except ContainerError as e:
        result['run'] = str(e.stderr, 'utf-8')
        shutil.rmtree(source_file_host_dir)
        return result
    
    shutil.rmtree(source_file_host_dir)
    return result