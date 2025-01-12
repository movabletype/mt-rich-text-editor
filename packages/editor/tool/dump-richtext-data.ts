import { parse } from "https://deno.land/std@0.220.1/flags/mod.ts";
import { Client } from "https://deno.land/x/mysql@v2.12.0/mod.ts";
import { ensureDir } from "https://deno.land/std@0.220.1/fs/mod.ts";
import { DOMParser, Text, Node, Element } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";

// Parse command line arguments
const flags = parse(Deno.args, {
  string: ["host", "user", "password", "database", "port", "output"],
  default: {
    host: "127.0.0.1",
    port: "3306",
    database: "test",
  },
});

async function promptForCredentials() {
  if (!flags.output) {
    const output = prompt("Please enter output directory:");
    if (!output) {
      console.error("Output directory is required");
      Deno.exit(1);
    }
    flags.output = output;
  }

  if (!flags.user) {
    const user = prompt("Please enter database username:");
    if (!user) {
      console.error("Username is required");
      Deno.exit(1);
    }
    flags.user = user;
  }

  if (!flags.password) {
    console.log("Please enter database password:");
    
    const password = new Uint8Array(1024);
    let position = 0;
    
    // Disable echo
    Deno.stdin.setRaw(true);
    
    while (true) {
      const chunk = new Uint8Array(1);
      const n = await Deno.stdin.read(chunk);
      if (!n) break;
      
      // Enter key
      if (chunk[0] === 13) {
        break;
      }
      
      // Store the character
      password[position] = chunk[0];
      position++;
    }
    
    // Restore original stdin mode
    Deno.stdin.setRaw(false);
    console.log(); // New line after password input
    
    if (position === 0) {
      console.error("Password is required");
      Deno.exit(1);
    }
    
    flags.password = new TextDecoder().decode(password.subarray(0, position)).trim();
  }
}

// Function to recursively traverse DOM tree and process text nodes
function replaceTextContent(node: Node) {
  // Replace all attribute values with "v"
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    const attributes = element.attributes;
    for (const attribute of attributes) {
      attribute.value = "v";
    }
  }

  // Handle text nodes
  if (node.nodeType === Node.TEXT_NODE && node.parentNode) {
    const newTextNode = new Text("t");
    node.parentNode.replaceChild(newTextNode, node);
    return;
  }

  // Process child nodes recursively
  for (const child of Array.from(node.childNodes)) {
    replaceTextContent(child);
  }
}

try {
  await promptForCredentials();

  // Connect to database
  const client = await new Client().connect({
    hostname: flags.host,
    username: flags.user,
    password: flags.password,
    db: flags.database,
    port: Number(flags.port),
  });

  await ensureDir(flags.output!);

  // Set batch size for processing
  const BATCH_SIZE = 100;
  let offset = 0;

  while (true) {
    // Fetch records in batches
    const results = await client.query(
      "SELECT entry_id, entry_text, entry_text_more FROM mt_entry WHERE entry_convert_breaks = 'richtext' LIMIT ? OFFSET ?",
      [BATCH_SIZE, offset]
    );

    // Exit if no more results
    if (results.length === 0) {
      break;
    }

    const parser = new DOMParser();

    // Process each record
    for (const row of results) {
      console.log(`Processing entry_id: ${row.entry_id}`);

      for (const field of ["text", "text_more"]) {
        const content = row[`entry_${field}`];
        if (!content) continue;

        const doc = parser.parseFromString(`<html><body>${content}</body></html>`, "text/html");

        if (!doc ||!doc.documentElement) {
          continue;
        }

        // Process the entire document recursively
        replaceTextContent(doc.documentElement);

        // Get processed HTML
        const processedContent = doc.documentElement?.querySelector("body")?.innerHTML;
        if (!processedContent) {
          continue;
        }

        const filePath = `${flags.output}/${row.entry_id}.${field}.html`;
        await Deno.writeTextFile(filePath, processedContent);
      }
    }

    // Update offset
    offset += BATCH_SIZE;
  }

  await client.close();
} catch (error) {
  console.error("An error occurred:", error);
  Deno.exit(1);
}
