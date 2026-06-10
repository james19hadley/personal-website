#include <string>
#include <sstream>
#include <vector>
#include <iostream>
#include "filesystem.hpp"

static FileSystem fs;

extern "C" {

const char* execute_command(const char* cmd_line) {
    static std::string output_buffer;
    output_buffer.clear();

    std::string line(cmd_line);
    if (line.empty()) return "";

    std::stringstream ss(line);
    std::string word;
    std::vector<std::string> args;
    while (ss >> word) {
        args.push_back(word);
    }
    if (args.empty()) return "";

    const std::string& cmd = args[0];

    // Redirect stdout/stderr to capture outputs
    std::streambuf* old_cout = std::cout.rdbuf();
    std::streambuf* old_cerr = std::cerr.rdbuf();
    std::stringstream capture_ss;
    std::cout.rdbuf(capture_ss.rdbuf());
    std::cerr.rdbuf(capture_ss.rdbuf());

    if (cmd == "ls") {
        if (args.size() >= 2) {
            fs.ls(args[1]);
        } else {
            fs.ls();
        }
    } else if (cmd == "pwd") {
        std::cout << fs.pwd() << "\n";
    } else if (cmd == "cd") {
        if (args.size() < 2) {
            std::cerr << "cd: missing operand\n";
        } else {
            auto err = fs.cd(args[1]);
            if (err != FSError::Success) {
                std::cerr << "cd: " << errorToString(err) << "\n";
            }
        }
    } else if (cmd == "mkdir") {
        if (args.size() < 2) {
            std::cerr << "mkdir: missing operand\n";
        } else {
            FSError err = fs.mkdir(args[1]);
            if (err != FSError::Success) {
                std::cerr << "mkdir: " << errorToString(err) << "\n";
            }
        }
    } else if (cmd == "touch") {
        if (args.size() < 2) {
            std::cerr << "touch: missing operand\n";
        } else {
            auto err = fs.touch(args[1]);
            if (err != FSError::Success) {
                std::cerr << "touch: " << errorToString(err) << "\n";
            }
        }
    } else if (cmd == "echo") {
        if (args.size() < 3) {
            std::cerr << "Usage: echo <content> <path>\n";
        } else {
            auto err = fs.writeToFile(args[2], args[1]);
            if (err != FSError::Success) {
                std::cerr << "echo: " << errorToString(err) << "\n";
            }
        }
    } else if (cmd == "cat") {
        if (args.size() < 2) {
            std::cerr << "cat: missing operand\n";
        } else {
            auto [content, err] = fs.readFromFile(args[1]);
            if (err == FSError::Success) {
                std::cout << content << "\n";
            } else {
                std::cerr << "cat: " << errorToString(err) << "\n";
            }
        }
    } else if (cmd == "ln") {
        if (args.size() < 4 || args[1] != "-s") {
            std::cerr << "Usage: ln -s <target> <link>\n";
        } else {
            auto err = fs.ln_s(args[2], args[3]);
            if (err != FSError::Success) {
                std::cerr << "ln: " << errorToString(err) << "\n";
            }
        }
    } else {
        std::cerr << "Unknown command!\n";
    }

    // Restore stdout/stderr
    std::cout.rdbuf(old_cout);
    std::cerr.rdbuf(old_cerr);

    output_buffer = capture_ss.str();
    return output_buffer.c_str();
}

const char* get_pwd() {
    static std::string pwd_buffer;
    pwd_buffer = fs.pwd();
    return pwd_buffer.c_str();
}

void serialize_dir_recursive(std::shared_ptr<Directory> dir, std::string current_path, std::stringstream& ss, bool& first) {
    if (!dir) return;

    for (auto const& [name, node] : dir->getChildren()) {
        std::string node_path = (current_path == "/" ? "" : current_path) + "/" + name;
        if (node->isDir()) {
            auto sub_dir = std::dynamic_pointer_cast<Directory>(node);
            if (sub_dir) {
                if (!first) ss << ",";
                first = false;
                ss << "{\"type\":\"D\",\"path\":\"" << node_path << "\"}";
                serialize_dir_recursive(sub_dir, node_path, ss, first);
            }
        } else if (auto file = std::dynamic_pointer_cast<File>(node)) {
            std::string content = std::string(file->read());
            std::string escaped_content = "";
            for (char c : content) {
                if (c == '"') escaped_content += "\\\"";
                else if (c == '\\') escaped_content += "\\\\";
                else if (c == '\n') escaped_content += "\\n";
                else if (c == '\r') escaped_content += "\\r";
                else if (c == '\t') escaped_content += "\\t";
                else escaped_content += c;
            }
            if (!first) ss << ",";
            first = false;
            ss << "{\"type\":\"F\",\"path\":\"" << node_path << "\",\"content\":\"" << escaped_content << "\"}";
        }
    }
}

const char* serialize_fs() {
    static std::string json_output;
    json_output.clear();

    std::stringstream ss;
    ss << "[";
    bool first = true;
    auto root_dir = std::dynamic_pointer_cast<Directory>(fs.resolvePath("/"));
    serialize_dir_recursive(root_dir, "/", ss, first);
    ss << "]";

    json_output = ss.str();
    return json_output.c_str();
}

void create_directory_raw(const char* path) {
    fs.mkdir(path);
}

void write_file_raw(const char* path, const char* content) {
    fs.touch(path);
    fs.writeToFile(path, content);
}

}
