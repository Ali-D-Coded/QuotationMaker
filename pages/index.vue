<script setup lang="ts">
const rows = ref([
  {
    id: generatePseudoUUID(),
    itemid: "",
    qtty: 1,
    disc: null,
    amt: null,
  },
]);

const addRow = (event: any) => {
  rows.value.push({
    // Add default values for new item properties like quantity and amount
    id: generatePseudoUUID(),
    qtty: 1,
  });
};
const removeRow = (id: number) => {
  console.log({ id });
  if (rows.value.length > 1) {
    rows.value = rows.value.filter((it: any) => it.id !== id);
  }
};

const items = ref([
  {
    id: generatePseudoUUID(),
    name: "Mobile App",
    amount: 10000,
  },
  {
    id: generatePseudoUUID(),
    name: "Web App",
    amount: 12345,
  },
  {
    id: generatePseudoUUID(),
    name: "Digital Marketting",
    amount: 10050,
  },
]);
const updateItemAmount = (id: string, qtt: number = 0, disc: number = 0) => {
  const targetRowIndex = rows.value.findIndex((it: any) => it.itemid === id);
  const targetItemIndex = items.value.findIndex((it: any) => it.id === id);
  const targetitem = items.value[targetItemIndex];
  let amt = 0;
  if (qtt > 0) {
    amt = qtt * targetitem.amount;
  }
  if (disc > 0) {
    const discamt = (amt / 100) * disc;
    amt = amt - discamt;
  }
  if (targetRowIndex !== -1) {
    rows.value[targetRowIndex].amt = amt;
  }
};

// Function to calculate subtotal
const calculateSubtotal = () => {
  return rows.value.reduce(
    (total: number, row: any) => total + (row.amt || 0),
    0
  );
};

// Function to calculate balance due (assuming no GST or other deductions)
const calculateBalance = () => {
  const sub = calculateSubtotal();
  const gst = (sub / 100) * 18;
  return sub + gst;
};

// Function to calculate GST
const calculateGST = () => {
  const sub = calculateSubtotal();
  const gst = (sub / 100) * 18;
  return gst.toFixed(2);
};

const formData = reactive({
  date: undefined,
  quote: "",
  customerId: "",
  validtill: undefined,
  customer: {
    companyName: "",
    name: "",
    address: "",
    email: "",
    phone: "",
  },
  items: [],
});

// Watch for changes in rows and update amounts accordingly
watch(
  rows,
  () => {
    rows.value.forEach((row: any) => {
      const item = items.value.find((it: any) => it.id === row.itemid);
      if (item) {
        updateItemAmount(row.itemid, row.qtty, row.disc);
      }
    });

    formData.items = rows.value.map((row: any) => ({
      id: row.itemid,
      name: items.value.find((item: any) => item.id === row.itemid)?.name || "",
      amount: row.amt || 0,
    }));
  },
  { deep: true }
);

const printPdf = async () => {
  console.log({
    formData,
    subTotal: calculateSubtotal(),
    gst: calculateGST(),
    balance: calculateBalance(),
  });

  // Send the request and expect a Blob response
  const response: any = await $fetch("/api/pdf/generate-pdf", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ test: 123 }),
  });

  console.log({ response });

  // Create a URL for the Blob
  const url = URL.createObjectURL(response);

  // Create a temporary anchor element to trigger the download
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotation.pdf"; // Set the desired file name
  document.body.appendChild(link);

  // Trigger the download by simulating a click
  link.click();

  // Clean up: remove the link element and revoke the URL
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
</script>
<template>
  <div class="h-screen w-screen grid place-items-center p-6 overflow-auto">
    <main
      class="p-3 border border-gray-300 h-fit w-[100%] min-w-[600px] max-w-[600px]"
    >
      <!-- Header section start-->
      <nav class="flex justify-between items-center mb-16">
        <div>
          <img src="/ashlogo336x52.svg" alt="" width="200" />
        </div>
        <div class="text-3xl font-bold text-[#72184F]">Quotation</div>
      </nav>
      <!-- Header section end -->

      <!-- Address section start-->
      <section class="flex justify-between items-center text-sm mb-8">
        <div>
          <table>
            <tr>
              <th class="text-left">ASHCORP Technologies</th>
            </tr>
            <tr>
              <td>2nd floor, OPS Mall, Vailathur,Tirur</td>
            </tr>
            <tr>
              <td>connect@ashcorptechnologies.com</td>
            </tr>
            <tr>
              <td>+91 8921365750</td>
            </tr>
          </table>
        </div>

        <div class="w-[250px]">
          <table class="w-full">
            <tr>
              <td class="w-[110px]">Date:</td>
              <td class="border border-gray-400">
                <input
                  type="date"
                  class="border w-[100%] outline-none"
                  v-model="formData.date"
                />
              </td>
            </tr>
            <tr>
              <td class="w-[110px]">Quote#:</td>
              <td class="border border-gray-400">
                <input
                  type="text"
                  class="border w-[100%] outline-none"
                  v-model="formData.quote"
                />
              </td>
            </tr>
            <tr>
              <td class="w-[110px]">Customer ID:</td>
              <td class="border border-gray-400">
                <input
                  type="text"
                  class="border w-[100%] outline-none"
                  v-model="formData.customerId"
                />
              </td>
            </tr>
            <tr>
              <td class="w-[110px]">Valid till:</td>
              <td class="border border-gray-400">
                <input
                  type="date"
                  class="border w-[100%] outline-none"
                  v-model="formData.validtill"
                />
              </td>
            </tr>
          </table>
        </div>
      </section>
      <!-- Address section end-->

      <!-- Customer Section start-->
      <section class="text-sm mb-10">
        <div class="w-[250px]">
          <table class="w-full">
            <tr class="mb-1">
              <th
                class="text-left text-white px-2 bg-[#83246D] font-normal"
                colspan="2"
              >
                Customer :
              </th>
            </tr>
            <tr>
              <td class="w-[110px]">Company Name:</td>
              <td class="">
                <input
                  type="text"
                  class="border w-[100%] outline-none"
                  v-model="formData.customer.companyName"
                />
              </td>
            </tr>
            <tr>
              <td class="w-[110px]">Name:</td>
              <td class="">
                <input
                  type="text"
                  class="border w-[100%] outline-none"
                  v-model="formData.customer.name"
                />
              </td>
            </tr>
            <tr>
              <td class="w-[110px]">Address:</td>
              <td class="">
                <input
                  type="text"
                  class="border w-[100%] outline-none"
                  v-model="formData.customer.address"
                />
              </td>
            </tr>
            <tr>
              <td class="w-[110px]">Email:</td>
              <td class="">
                <input
                  type="email"
                  class="border w-[100%] outline-none"
                  v-model="formData.customer.email"
                />
              </td>
            </tr>
            <tr>
              <td class="w-[110px]">Phone:</td>
              <td class="">
                <input
                  type="tel"
                  class="border w-[100%] outline-none"
                  v-model="formData.customer.phone"
                />
              </td>
            </tr>
          </table>
        </div>
      </section>
      <!-- Customer Section end-->

      <!-- Items Section start-->
      <section class="mb-10 text-sm">
        <div>
          <!-- {{ rows }} -->
          <table class="w-full itemtable">
            <thead class="text-white">
              <tr>
                <th class="border itemth bg-[#83246D] font-normal">Item#</th>
                <th class="border itemth bg-[#83246D] font-normal w-[130px]">
                  Quantity
                </th>
                <th class="border itemth bg-[#83246D] font-normal w-[130px]">
                  Discount
                </th>
                <th class="border itemth bg-[#83246D] font-normal w-[180px]">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in rows"
                :key="index"
                class="bg-gray-200 relative"
                v-on:dblclick="() => removeRow(row.id)"
              >
                <td class="itemtd">
                  <select
                    name=""
                    id=""
                    v-model="row.itemid"
                    class="outline-none"
                  >
                    <option value="">Select item</option>
                    <option
                      v-for="(item, index) in items"
                      :key="index"
                      :value="item.id"
                    >
                      {{ item.name }}
                    </option>
                  </select>
                </td>

                <td class="itemtd">
                  <input
                    v-model="row.qtty"
                    @change="() => updateItemAmount(row.itemid, row.qtty)"
                    type="number"
                    class="border w-[100%] outline-none bg-transparent"
                  />
                </td>
                <td class="itemtd">
                  <input
                    v-model="row.disc"
                    @change="
                      () => updateItemAmount(row.itemid, row.qtty, row.disc)
                    "
                    type="number"
                    class="border w-[100%] outline-none bg-transparent"
                  />
                </td>

                <td class="itemtd">
                  <!-- <input
                    :value="row.amt"
                    type="text"
                    class="border w-[100%] outline-none bg-transparent"
                  /> -->
                  {{ row.amt }}
                </td>
              </tr>

              <tr>
                <td colspan="4">
                  <button class="border p-2 bg-blue-300 w-full" @click="addRow">
                    add new row
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end">
          <table class="w-[310px] itemtable">
            <tr>
              <td class="itemtd w-[129px] font-bold">Sub Total:</td>
              <td class="itemtd border border-gray-400">
                {{ calculateSubtotal() }}
              </td>
            </tr>
            <tr>
              <td class="itemtd w-[129px] font-bold">GST:</td>
              <td class="itemtd border border-gray-400">
                {{ calculateGST() }}
              </td>
            </tr>

            <tr>
              <td class="itemtd w-[129px] font-bold">Balance:</td>
              <td class="itemtd border border-gray-400">
                {{ calculateBalance() }}
              </td>
            </tr>
          </table>
        </div>
      </section>

      <!-- Items Section end-->

      <section
        class="bg-gray-300 h-10 flex justify-center items-center text-white text-xl"
      >
        Thank You For Your Business!
      </section>
    </main>
    <button class="bg-red-300 border-2 p-4" @click="printPdf">Print</button>
  </div>
</template>

<style scoped>
.itemtable,
.itemtd,
.itemth {
  border-collapse: collapse;
  border: 1px solid rgb(164, 164, 164);
}
</style>
